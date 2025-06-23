"use client";

import { DataSet } from '@/types/dashboard';
import ModelHeader from './ModelHeader';
import { DEFAULT_ROW_COUNT, DEFAULT_COLUMN_COUNT, CARRIER_OPTIONS, CONTRACT_OPTIONS, JOIN_TYPE_OPTIONS, PLAN_BG_COLORS, COMPANY_TEXT_COLORS } from '@/styles/common';
import { useMemo, useState, useEffect } from 'react';
import { getDynamicCellStyle, getDataCellStyle, getModelSheetCellStyle } from '@/app/dashboard/utils/common/colorUtils';
import { 
  calculateFinalAmount, 
  calculateHighlightedTotalCells 
} from '@/app/dashboard/utils/model/calculationUtils';

interface ModelSheetProps {
  dataSets: DataSet[];
  setDataSets: (dataSets: DataSet[]) => void;
  publicData: any; // 공시 데이터 추가
}

// 머리글 정의
const HEADERS = [
  '통신사', '지원 구분', '요금제', '가입 유형', '업체명', 
  '출고가', '정책지원금', '공시지원금', '부가서비스', '합계'
];

export default function ModelSheet({ dataSets, setDataSets, publicData }: ModelSheetProps) {
  const [selectedModelContent, setSelectedModelContent] = useState<string>('');

  // 통합 데이터셋에서 1~5행 데이터를 가져와서 시트 데이터 생성
  const generateSheetData = useMemo(() => {
    const integratedDataSet = dataSets.find(dataset => dataset.type === 'integrated');
    if (!integratedDataSet?.data.sheetData) {
      return Array(DEFAULT_ROW_COUNT - 1).fill(null).map(() => Array(HEADERS.length).fill(''));
    }

    const integratedData = integratedDataSet.data.sheetData;
    const result: string[][] = [];

    // 통합 데이터의 1~5행을 가로로 읽어서 세로로 배치 (A열 제외, B열부터)
    // 1행(통신사), 2행(지원구분), 3행(요금제), 4행(가입유형), 5행(업체명)을 각각 1~5열에 배치
    const row1Data = (integratedData[0] || []).slice(1); // 1행: 통신사 (A열 제외)
    const row2Data = (integratedData[1] || []).slice(1); // 2행: 지원구분 (A열 제외)
    const row3Data = (integratedData[2] || []).slice(1); // 3행: 요금제 (A열 제외)
    const row4Data = (integratedData[3] || []).slice(1); // 4행: 가입유형 (A열 제외)
    const row5Data = (integratedData[4] || []).slice(1); // 5행: 업체명 (A열 제외)

    // 각 열의 데이터 개수만큼 행 생성
    const maxCols = Math.max(row1Data.length, row2Data.length, row3Data.length, row4Data.length, row5Data.length);
    
    for (let colIndex = 0; colIndex < maxCols; colIndex++) {
      const row = Array(HEADERS.length).fill('');
      
      // 1열: 통신사 (1행 데이터)
      row[0] = row1Data[colIndex] || '';
      // 2열: 지원구분 (2행 데이터)
      row[1] = row2Data[colIndex] || '';
      // 3열: 요금제 (3행 데이터) - 요금제명만 표시하고 월 요금은 내부에 저장
      const planData = row3Data[colIndex] || '';
      if (planData.includes('|')) {
        const planParts = planData.split('|');
        const planName = planParts[0]; // 요금제명
        const monthlyFees = planParts.slice(1).join('|'); // 월 요금 정보
        row[2] = planName; // 표시용: 요금제명만
        // 내부 저장용: 요금제명|월요금 형태로 저장 (나중에 사용할 수 있도록)
        row[2] = `${planName}|${monthlyFees}`;
      } else {
        row[2] = planData;
      }
      // 4열: 가입유형 (4행 데이터)
      row[3] = row4Data[colIndex] || '';
      // 5열: 업체명 (5행 데이터)
      row[4] = row5Data[colIndex] || '';
      
      result.push(row);
    }

    // 최소 행 수 보장
    while (result.length < DEFAULT_ROW_COUNT - 1) {
      result.push(Array(HEADERS.length).fill(''));
    }

    return result;
  }, [dataSets]);

  const [sheetData, setSheetData] = useState<string[][]>(generateSheetData);

  // 통합 데이터셋이 변경될 때 시트 데이터 업데이트
  useEffect(() => {
    setSheetData(generateSheetData);
  }, [generateSheetData]);

  // 계산 함수들이 선언된 후에 useMemo를 사용합니다.
  const highlightedTotalCells = useMemo(() => {
    return calculateHighlightedTotalCells(sheetData, selectedModelContent, dataSets, publicData);
  }, [sheetData, selectedModelContent, dataSets, publicData]);

  const handleModelSelect = (modelContent: string) => {
    setSelectedModelContent(modelContent);
    
    // 선택된 모델의 출고가를 추출하여 출고가열(6열)에 적용
    if (modelContent && modelContent.includes('price:')) {
      const priceMatch = modelContent.match(/price:(\d+)/);
      if (priceMatch) {
        const price = priceMatch[1];
        const formattedPrice = Number(price).toLocaleString(); // 천 단위 콤마 추가
        
        // 현재 시트 데이터를 복사하여 출고가열(6열)에 출고가 적용
        const updatedSheetData = sheetData.map(row => {
          const newRow = [...row];
          newRow[5] = formattedPrice; // 6열(출고가)에 출고가 적용
          return newRow;
        });
        
        setSheetData(updatedSheetData);
      }
    }
  };

  // 반응형 열 너비 계산
  const getColumnWidth = useMemo(() => {
    const numCols = HEADERS.length;
    
    // 통신사~업체명(0~4번 인덱스)은 좁게, 출고가부터 합계까지(5~9번 인덱스)는 넓게 설정
    const narrowWidth = '100px';  // 통신사~업체명 열 너비
    const wideWidth = '140px';    // 출고가~합계 열 너비
    
    const columnWidths = HEADERS.map((_, index) => {
      if (index >= 5) { // 출고가부터 합계까지
        return wideWidth;
      }
      return narrowWidth;
    });
    
    return columnWidths;
  }, []);

  return (
    <div className="flex flex-col w-full h-full">
      <div className="max-w-[61rem] mx-auto w-full px-4">
        <ModelHeader 
          dataSets={dataSets} 
          setDataSets={setDataSets}
          onModelSelect={handleModelSelect}
          selectedModelContent={selectedModelContent}
          publicData={publicData}
        />
      </div>

      {/* 테이블 카드 */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 mb-4 h-[800px] max-w-full mx-4 sm:max-w-6xl sm:mx-auto lg:max-w-7xl">
        <div className="overflow-auto h-full">
          <table className="border-collapse w-full" style={{ tableLayout: 'fixed' }}>
            <colgroup>
              {getColumnWidth.map((width, index) => (
                <col key={index} style={{ width, minWidth: width }} />
              ))}
            </colgroup>
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                {HEADERS.map((header, index) => (
                  <th
                    key={index}
                    className="h-8 text-sm font-bold text-gray-800 border-r border-gray-300 px-2 text-center"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {!selectedModelContent ? (
                // 모델 선택 없을 때 빈 행들 표시
                Array(DEFAULT_ROW_COUNT - 1).fill(null).map((_, rowIndex) => (
                  <tr key={rowIndex} className="hover:bg-gray-50">
                    {Array(HEADERS.length).fill(null).map((_, colIndex) => (
                      <td
                        key={colIndex}
                        className="h-6 text-sm border-b border-gray-200 border-r border-gray-300 text-center"
                      >
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          {colIndex === 0 && rowIndex === 0 }
                        </div>
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                // 모델 선택 시 기존 데이터 표시
                sheetData.map((row, rowIndex) => (
                  <tr key={rowIndex} className="hover:bg-gray-50">
                    {row.map((cell, colIndex) => (
                      <td
                        key={colIndex}
                        className="h-6 text-sm border-b border-gray-200 border-r border-gray-300 text-center"
                      >
                        <div className={`w-full h-full flex items-center justify-center ${getModelSheetCellStyle(colIndex, cell, rowIndex, sheetData)}`}>
                          {(() => {
                            if (colIndex === 9) { // 합계 열
                              const isHighlighted = highlightedTotalCells.has(rowIndex);
                              const calculation = calculateFinalAmount(rowIndex, sheetData, selectedModelContent, dataSets, publicData);
                              const joinType = sheetData[rowIndex]?.[3]?.trim();

                              if (calculation.policySupport === 0 && calculation.finalAmount === 0) {
                                return '';
                              }
                              
                              const finalAmount = calculation.finalAmount * 10000;
                              const cellContent = finalAmount.toLocaleString();
                              
                              if (isHighlighted) {
                                let styleClass = 'inline-block text-center min-w-[60px] rounded-md py-0.5 font-bold ';
                                switch (joinType) {
                                  case '번호이동': styleClass += 'bg-blue-400 '; break;
                                  case '기기변경': styleClass += 'bg-green-400 '; break;
                                  case '신규가입': styleClass += 'bg-red-400 '; break;
                                  default: styleClass += 'bg-gray-400 ';
                                }

                                if (calculation.finalAmount < 0) styleClass += 'text-red-700';
                                else styleClass += 'text-black';

                                return <span className={styleClass}>{cellContent}</span>;
                              }
                              
                              if (calculation.finalAmount < 0) {
                                return <span className="text-red-500">{cellContent}</span>;
                              }
                              return cellContent;
                            }
                            
                            if (colIndex === 6) { // 정책지원금
                              const calculation = calculateFinalAmount(rowIndex, sheetData, selectedModelContent, dataSets, publicData);
                              return calculation.policySupport > 0 ? (calculation.policySupport * 10000).toLocaleString() : '';
                            }
                            if (colIndex === 7) { // 공시지원금
                              const calculation = calculateFinalAmount(rowIndex, sheetData, selectedModelContent, dataSets, publicData);
                              return calculation.publicSupport > 0 ? calculation.publicSupport.toLocaleString() : '';
                            }
                            if (colIndex === 8) { // 부가서비스
                              const calculation = calculateFinalAmount(rowIndex, sheetData, selectedModelContent, dataSets, publicData);
                              return calculation.additionalService > 0 ? calculation.additionalService.toLocaleString() : '';
                            }
                            if (colIndex === 2) { // 요금제
                              return cell.split('|')[0];
                            }
                            return cell; // 기본 셀 값
                          })()}
                        </div>
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
} 