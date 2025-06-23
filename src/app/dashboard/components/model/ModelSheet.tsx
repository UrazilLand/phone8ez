"use client";

import { DataSet } from '@/types/dashboard';
import ModelHeader from './ModelHeader';
import { DEFAULT_ROW_COUNT, DEFAULT_COLUMN_COUNT, CARRIER_OPTIONS, CONTRACT_OPTIONS, JOIN_TYPE_OPTIONS, PLAN_BG_COLORS, COMPANY_TEXT_COLORS } from '@/styles/common';
import { useMemo, useState, useEffect } from 'react';
import { getDynamicCellStyle, getDataCellStyle } from '@/app/dashboard/utils/common/colorUtils';

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

  // 먼저 계산 함수들을 모두 선언합니다.
  const getPriceFromModelContent = (modelContent: string): number => {
    if (modelContent && modelContent.includes('price:')) {
      const priceMatch = modelContent.match(/price:(\d+)/);
      if (priceMatch) {
        return Number(priceMatch[1]) || 0;
      }
    }
    return 0;
  };

  const getPolicySupportAmount = (rowIndex: number): number => {
    const integratedDataSet = dataSets.find(dataset => dataset.type === 'integrated');
    if (!integratedDataSet?.data.sheetData) return 0;

    const integratedData = integratedDataSet.data.sheetData;
    const carrier = sheetData[rowIndex]?.[0]?.trim(); // 해당 행의 통신사
    const supportType = sheetData[rowIndex]?.[1]?.trim(); // 해당 행의 지원구분
    const planName = sheetData[rowIndex]?.[2]?.split('|')[0]; // 해당 행의 요금제명
    const joinType = sheetData[rowIndex]?.[3]?.trim(); // 해당 행의 가입유형
    const company = sheetData[rowIndex]?.[4]?.trim(); // 해당 행의 업체명

    if (!carrier || !supportType || !planName || !joinType || !company) return 0;

    // 통합 데이터에서 해당 조건에 맞는 데이터 찾기
    for (let col = 1; col < integratedData[0].length; col++) {
      const integratedCarrier = integratedData[0]?.[col]?.trim();
      const integratedSupportType = integratedData[1]?.[col]?.trim();
      const integratedPlanName = integratedData[2]?.[col]?.split('|')[0];
      const integratedJoinType = integratedData[3]?.[col]?.trim();
      const integratedCompany = integratedData[4]?.[col]?.trim();

      if (
        integratedCarrier === carrier &&
        integratedSupportType === supportType &&
        integratedPlanName === planName &&
        integratedJoinType === joinType &&
        integratedCompany === company
      ) {
        // 6행부터 모델 데이터 확인
        for (let row = 5; row < integratedData.length; row++) {
          const modelCellData = integratedData[row]?.[0] || '';
          if (modelCellData.includes('codes:')) {
            const codesPart = modelCellData.split('|').find(p => p.startsWith('codes:'));
            if (codesPart) {
              const targetModelCodes = codesPart.replace('codes:', '').split(',');
              
              // 다른 데이터셋에서 해당 모델 코드의 정책지원금 찾기
              for (const dataSet of dataSets) {
                if (dataSet.type === 'integrated') continue;
                
                const sourceSheet = dataSet.data.sheetData;
                if (!sourceSheet || sourceSheet.length < 5) continue;

                for (let sourceCol = 1; sourceCol < sourceSheet[0].length; sourceCol++) {
                  if (
                    carrier === sourceSheet[0]?.[sourceCol]?.trim() &&
                    supportType === sourceSheet[1]?.[sourceCol]?.trim() &&
                    planName === (sourceSheet[2]?.[sourceCol]?.trim() || '').split('|')[0] &&
                    joinType === sourceSheet[3]?.[sourceCol]?.trim() &&
                    company === sourceSheet[4]?.[sourceCol]?.trim()
                  ) {
                    for (let sourceRow = 5; sourceRow < sourceSheet.length; sourceRow++) {
                      const sourceModelCode = sourceSheet[sourceRow]?.[0]?.trim();
                      if (sourceModelCode && targetModelCodes.includes(sourceModelCode)) {
                        const cellValue = sourceSheet[sourceRow]?.[sourceCol] || '';
                        const numericValue = cellValue.replace(/[^\d-]/g, '');
                        if (numericValue) {
                          return Number(numericValue);
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
    return 0;
  };

  const getPublicSupportAmount = (rowIndex: number): number => {
    // 헤더의 선택된 드롭박스 내용에서 표준 모델번호 추출
    const standardModel = selectedModelContent?.split('|').find(p => p.startsWith('standard:'))?.replace('standard:', '') || '';
    const joinType = sheetData[rowIndex]?.[3]?.trim() || '';
    const carrier = sheetData[rowIndex]?.[0]?.trim() || '';
    
    // 3열에서 내부 저장된 월 요금 추출
    const planCell = sheetData[rowIndex]?.[2] || '';
    const planParts = planCell.split('|');
    const monthlyFee1 = planParts[1] ? Number(planParts[1]) : null;
    const monthlyFee2 = planParts[2] ? Number(planParts[2]) : null;
    
    if (!standardModel || (monthlyFee1 === null && monthlyFee2 === null) || !carrier) {
      return 0;
    }

    if (!publicData) {
      return 0;
    }
    
    for (const [manufacturerName, manufacturer] of Object.entries(publicData.manufacturers)) {
      const typedManufacturer = manufacturer as any;
      if (typedManufacturer.models) {
        for (const model of typedManufacturer.models) {
          if (model.model_number === standardModel) {
            for (const section of model.support_info.sections) {
              for (const [carrierName, carrierInfo] of Object.entries(section.carriers)) {
                if (carrierInfo && typeof carrierInfo === 'object' && carrierName === carrier) {
                  const carrierMonthlyFee = (carrierInfo as any).monthly_fee;
                  const isMonthlyFeeMatch = (monthlyFee1 !== null && carrierMonthlyFee === monthlyFee1) || 
                                          (monthlyFee2 !== null && carrierMonthlyFee === monthlyFee2);
                  
                  if (isMonthlyFeeMatch) {
                    let supportAmount = 0;
                    if (joinType === '번호이동') {
                      supportAmount = (carrierInfo as any).number_port_support || 0;
                    } else {
                      supportAmount = (carrierInfo as any).device_support || 0;
                    }
                    
                    if (supportAmount > 0) {
                      return Number(supportAmount);
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
    
    return 0;
  };

  const getAdditionalServiceAmount = (rowIndex: number): number => {
    const carrier = sheetData[rowIndex]?.[0]?.trim() || '';
    const company = sheetData[rowIndex]?.[4]?.trim() || '';
    const serviceKey = `${company}-${carrier}`;
    
    if (!carrier || !company) {
      return 0;
    }

    const additionalDataSet = dataSets.find(ds => ds.type === 'additional');
    if (!additionalDataSet?.data.additionalServices) {
        return 0;
    }

    const additionalServices = additionalDataSet.data.additionalServices;
    const companyServices = additionalServices[serviceKey];

    if (!companyServices) {
        return 0;
    }

    let totalAmount = 0;
    companyServices.forEach(service => {
      const discount = Number(service.discount) || 0;
      totalAmount += discount;
    });

    return totalAmount;
  };

  const calculateFinalAmount = (rowIndex: number): { 
    finalAmount: number; 
    price: number; 
    policySupport: number; 
    publicSupport: number; 
    additionalService: number; 
  } => {
    const price = getPriceFromModelContent(selectedModelContent);
    const policySupport = getPolicySupportAmount(rowIndex);
    const publicSupport = getPublicSupportAmount(rowIndex);
    const additionalService = getAdditionalServiceAmount(rowIndex);
    
    if (policySupport === 0) {
      return { finalAmount: 0, price, policySupport: 0, publicSupport, additionalService };
    }
    
    const finalAmount = Math.floor((price - policySupport * 10000 - publicSupport - additionalService) / 10000);
    return { finalAmount, price, policySupport, publicSupport, additionalService };
  };

  // 계산 함수들이 선언된 후에 useMemo를 사용합니다.
  const highlightedTotalCells = useMemo(() => {
    const minTotals: Record<string, number> = {}; // key: `${carrier}-${joinType}`
    const finalAmounts: { rowIndex: number; carrier: string; joinType: string; total: number }[] = [];

    sheetData.forEach((row, rowIndex) => {
      const carrier = row[0]?.trim();
      const joinType = row[3]?.trim();
      if (carrier && joinType) {
        const calculation = calculateFinalAmount(rowIndex);
        if (calculation.policySupport > 0 || calculation.finalAmount !== 0) {
          finalAmounts.push({ rowIndex, carrier, joinType, total: calculation.finalAmount });
        }
      }
    });

    finalAmounts.forEach(({ carrier, joinType, total }) => {
      const key = `${carrier}-${joinType}`;
      if (minTotals[key] === undefined || total < minTotals[key]) {
        minTotals[key] = total;
      }
    });

    const highlightSet = new Set<number>();
    finalAmounts.forEach(({ rowIndex, carrier, joinType, total }) => {
      const key = `${carrier}-${joinType}`;
      if (minTotals[key] === total) {
        highlightSet.add(rowIndex);
      }
    });

    return highlightSet;
  }, [sheetData, selectedModelContent]); // calculateFinalAmount는 컴포넌트 스코프에 있으므로 의존성 배열에 추가할 필요가 없습니다.

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

  // 셀 스타일을 결정하는 함수
  const getCellStyle = (colIndex: number, cellValue: string, rowIndex: number) => {
    if (colIndex === 0) {
      // 1열: 통신사 색상
      const carrier = CARRIER_OPTIONS.find(option => 
        option.variants.includes(cellValue.trim())
      );
      return carrier ? carrier.style : 'text-black';
    } else if (colIndex === 1) {
      // 2열: 지원구분 색상
      const contract = CONTRACT_OPTIONS.find(option => 
        option.value === cellValue.trim()
      );
      return contract ? contract.style : 'text-black';
    } else if (colIndex === 2) {
      // 3열: 요금제 배경색 (순환) - 전체 문자열로 색상 결정
      const planIndex = Math.abs(cellValue.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)) % PLAN_BG_COLORS.length;
      return `${PLAN_BG_COLORS[planIndex]} text-black font-medium rounded`;
    } else if (colIndex === 3) {
      // 4열: 가입유형 색상
      const joinType = JOIN_TYPE_OPTIONS.find(option => 
        option.value === cellValue.trim()
      );
      return joinType ? joinType.style : 'text-black';
    } else if (colIndex === 4) {
      // 5열: 업체명 색상 (순환) + 통신사별 교차 배경색
      const companyIndex = Math.abs(cellValue.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)) % COMPANY_TEXT_COLORS.length;
      const textColor = `${COMPANY_TEXT_COLORS[companyIndex]} font-medium`;
      
      // 통신사별 교차 배경색 적용 (출고가 열과 동일)
      const carrier = sheetData[rowIndex]?.[0]?.trim();
      let bgColor = '';
      
      if (carrier) {
        const isEvenRow = rowIndex % 2 === 0;
        if (isEvenRow) {
          // 짝수 행: 더 진한 색상
          switch (carrier) {
            case 'SK':
              bgColor = 'bg-red-200';
              break;
            case 'KT':
              bgColor = 'bg-gray-200';
              break;
            case 'LG':
              bgColor = 'bg-purple-200';
              break;
          }
        } else {
          // 홀수 행: 더 연한 색상
          switch (carrier) {
            case 'SK':
              bgColor = 'bg-red-50';
              break;
            case 'KT':
              bgColor = 'bg-gray-50';
              break;
            case 'LG':
              bgColor = 'bg-purple-50';
              break;
          }
        }
      } else {
        // 통신사 정보가 없는 경우 기본 교차색상
        const isEvenRow = rowIndex % 2 === 0;
        bgColor = isEvenRow ? 'bg-gray-200' : 'bg-gray-100';
      }
      
      return `${textColor} ${bgColor}`;
    } else if (colIndex >= 5) {
      // 6열(출고가열)부터: 통신사에 따른 배경색 적용 + 교차 색상
      // 해당 행의 1열(통신사)을 참조하여 배경색 결정
      const carrier = sheetData[rowIndex]?.[0]?.trim();
      
      if (carrier) {
        const isEvenRow = rowIndex % 2 === 0;
        if (isEvenRow) {
          // 짝수 행: 더 진한 색상
          switch (carrier) {
            case 'SK':
              return 'bg-red-200';
            case 'KT':
              return 'bg-gray-200';
            case 'LG':
              return 'bg-purple-200';
          }
        } else {
          // 홀수 행: 더 연한 색상
          switch (carrier) {
            case 'SK':
              return 'bg-red-50';
            case 'KT':
              return 'bg-gray-50';
            case 'LG':
              return 'bg-purple-50';
          }
        }
      }
      return 'bg-gray-50';
    }
    return 'text-black';
  };

  return (
    <div className="flex flex-col w-full h-full">
      <div className="max-w-[61rem] mx-auto w-full px-4">
        <ModelHeader 
          dataSets={dataSets} 
          setDataSets={setDataSets}
          onModelSelect={handleModelSelect}
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
                        <div className={`w-full h-full flex items-center justify-center ${getCellStyle(colIndex, cell, rowIndex)}`}>
                          {(() => {
                            if (colIndex === 9) { // 합계 열
                              const isHighlighted = highlightedTotalCells.has(rowIndex);
                              const calculation = calculateFinalAmount(rowIndex);
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
                              const calculation = calculateFinalAmount(rowIndex);
                              return calculation.policySupport > 0 ? (calculation.policySupport * 10000).toLocaleString() : '';
                            }
                            if (colIndex === 7) { // 공시지원금
                              const calculation = calculateFinalAmount(rowIndex);
                              return calculation.publicSupport > 0 ? calculation.publicSupport.toLocaleString() : '';
                            }
                            if (colIndex === 8) { // 부가서비스
                              const calculation = calculateFinalAmount(rowIndex);
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