"use client";

import { DataSet } from '@/types/dashboard';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { X, GripVertical } from 'lucide-react';
import { BUTTON_THEME, CONTRACT_OPTIONS, JOIN_TYPE_OPTIONS } from '@/components/ui/colors';
import { useState, useEffect } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface DataInputModalProps {
  isOpen: boolean;
  onClose: () => void;
  dataSets: DataSet[];
  setDataSets: (dataSets: DataSet[]) => void;
  onApplyData?: (data: any) => void;
}

// 드래그 가능한 항목 컴포넌트
function SortableItem({ id, children }: { id: string; children: React.ReactNode }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      {children}
    </div>
  );
}

export default function DataInputModal({
  isOpen,
  onClose,
  dataSets,
  setDataSets,
  onApplyData,
}: DataInputModalProps) {
  // 지원 구분 항목들 (CONTRACT_OPTIONS 참고)
  const [supportItems, setSupportItems] = useState([
    { id: 'support-1', label: '공시', value: '', style: 'text-green-700 font-bold' },
    { id: 'support-2', label: '선약', value: '', style: 'text-cyan-600 font-bold' },
  ]);

  // 가입 유형 항목들 (JOIN_TYPE_OPTIONS 참고)
  const [joinItems, setJoinItems] = useState([
    { id: 'join-1', label: '번호이동', value: '', style: 'bg-blue-500 text-white' },
    { id: 'join-2', label: '기기변경', value: '', style: 'bg-green-600 text-white' },
    { id: 'join-3', label: '신규가입', value: '', style: 'bg-red-500 text-white' },
  ]);

  // 통신사 선택 state 추가
  const [selectedCarrier, setSelectedCarrier] = useState('');

  // 요금제 분류 관련 state
  const [planMainInput, setPlanMainInput] = useState('');
  const [planRepeatCount, setPlanRepeatCount] = useState('');
  const [planSubInputs, setPlanSubInputs] = useState(['', '', '', '', '', '', '', '']);

  // 업체명 분류 관련 state
  const [companyMainInput, setCompanyMainInput] = useState('');
  const [companyRepeatCount, setCompanyRepeatCount] = useState('');
  const [companySubInputs, setCompanySubInputs] = useState(['', '', '', '', '', '', '', '']);

  const handleCarrierChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCarrier(e.target.value);
  };

  // 요금제 분류 붙여넣기 처리 함수
  const handlePlanPaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData('text');
    
    // 탭으로 구분된 데이터를 파싱
    const tabSeparated = pastedText.split('\t');
    const items: string[] = [];
    
    tabSeparated.forEach(item => {
      const trimmed = item.trim();
      if (trimmed) {
        items.push(trimmed);
      }
    });

    // 최대 8개까지만 설정
    const newSubInputs = [...planSubInputs];
    items.slice(0, 8).forEach((item, index) => {
      newSubInputs[index] = item;
    });

    setPlanSubInputs(newSubInputs);
  };

  // 업체명 분류 붙여넣기 처리 함수
  const handleCompanyPaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData('text');
    
    // 탭으로 구분된 데이터를 파싱
    const tabSeparated = pastedText.split('\t');
    const items: string[] = [];
    
    tabSeparated.forEach(item => {
      const trimmed = item.trim();
      if (trimmed) {
        items.push(trimmed);
      }
    });

    // 최대 8개까지만 설정
    const newSubInputs = [...companySubInputs];
    items.slice(0, 8).forEach((item, index) => {
      newSubInputs[index] = item;
    });

    setCompanySubInputs(newSubInputs);
  };

  // 요금제 하위 입력창 변경 핸들러
  const handlePlanSubInputChange = (index: number, value: string) => {
    const newSubInputs = [...planSubInputs];
    newSubInputs[index] = value;
    setPlanSubInputs(newSubInputs);
  };

  // 업체명 하위 입력창 변경 핸들러
  const handleCompanySubInputChange = (index: number, value: string) => {
    const newSubInputs = [...companySubInputs];
    newSubInputs[index] = value;
    setCompanySubInputs(newSubInputs);
  };

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleSupportDragEnd = (event: any) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      setSupportItems((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);

        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleJoinDragEnd = (event: any) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      setJoinItems((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);

        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleSupportValueChange = (id: string, value: string) => {
    setSupportItems(items => 
      items.map(item => 
        item.id === id ? { ...item, value } : item
      )
    );
  };

  const handleJoinValueChange = (id: string, value: string) => {
    setJoinItems(items => 
      items.map(item => 
        item.id === id ? { ...item, value } : item
      )
    );
  };

  // 초기화 함수
  const handleReset = () => {
    setSelectedCarrier('');
    setSupportItems([
      { id: 'support-1', label: '공시', value: '', style: 'text-green-700 font-bold' },
      { id: 'support-2', label: '선약', value: '', style: 'text-cyan-600 font-bold' },
    ]);
    setJoinItems([
      { id: 'join-1', label: '번호이동', value: '', style: 'bg-blue-500 text-white' },
      { id: 'join-2', label: '기기변경', value: '', style: 'bg-green-600 text-white' },
      { id: 'join-3', label: '신규가입', value: '', style: 'bg-red-500 text-white' },
    ]);
    setPlanMainInput('');
    setPlanRepeatCount('');
    setPlanSubInputs(['', '', '', '', '', '', '', '']);
    setCompanyMainInput('');
    setCompanyRepeatCount('');
    setCompanySubInputs(['', '', '', '', '', '', '', '']);
  };

  // 적용 버튼 클릭 핸들러
  const handleApply = () => {
    const modalData = {
      carrier: selectedCarrier,
      supportItems,
      joinItems,
      planMainInput,
      planRepeatCount,
      planSubInputs,
      companyMainInput,
      companyRepeatCount,
      companySubInputs,
    };

    console.log('Modal data being sent:', modalData);
    console.log('Support items:', supportItems);
    console.log('Join items:', joinItems);

    if (onApplyData) {
      onApplyData(modalData);
    }
    
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="flex flex-row items-center justify-between space-y-0">
          <DialogTitle className="text-lg font-bold text-blue-600">
            데이터 입력
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* 상단 1:1 비율 카드 2개 */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              {/* 통신사 선택 */}
              <div className="flex items-center justify-between">
                <div className="px-6 text-base font-semibold text-black">통신사</div>
                <select 
                  className={`w-32 h-8 px-4 text-sm font-bold border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    selectedCarrier === 'SK' ? 'text-red-600' :
                    selectedCarrier === 'KT' ? 'text-black' :
                    selectedCarrier === 'LG' ? 'text-pink-700' : 'text-black'
                  }`}
                  value={selectedCarrier}
                  onChange={handleCarrierChange}
                >
                  <option value="" disabled hidden>선택하세요</option>
                  <option value="SK" className="text-red-600 font-bold">SK</option>
                  <option value="KT" className="text-black font-bold">KT</option>
                  <option value="LG" className="text-pink-700 font-bold">LG</option>
                </select>
              </div>

              <Card className="h-40">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-semibold text-black">
                    지원 구분
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleSupportDragEnd}
                  >
                    <SortableContext items={supportItems.map(item => item.id)} strategy={verticalListSortingStrategy}>
                      <div className="space-y-2">
                        {supportItems.map((item) => (
                          <SortableItem key={item.id} id={item.id}>
                            <div className="flex items-center justify-between border border-gray-200 rounded-md bg-white hover:bg-gray-50 cursor-move">
                              <div className="flex items-center gap-2">
                                <GripVertical className="w-6 h-4 text-gray-400" />
                                <span className={`text-sm ${item.style}`}>{item.label}</span>
                              </div>
                              <div 
                                onMouseDown={(e) => e.stopPropagation()}
                                onTouchStart={(e) => e.stopPropagation()}
                                onPointerDown={(e) => e.stopPropagation()}
                                onClick={(e) => e.stopPropagation()}
                              >
                                <input 
                                  type="number" 
                                  placeholder="반복 횟수" 
                                  value={item.value}
                                  onChange={(e) => handleSupportValueChange(item.id, e.target.value)}
                                  onMouseDown={(e) => e.stopPropagation()}
                                  onTouchStart={(e) => e.stopPropagation()}
                                  onPointerDown={(e) => e.stopPropagation()}
                                  onClick={(e) => e.stopPropagation()}
                                  className="w-24 h-8 px-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                              </div>
                            </div>
                          </SortableItem>
                        ))}
                      </div>
                    </SortableContext>
                  </DndContext>
                </CardContent>
              </Card>
            </div>
            
            <Card className="h-50">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold text-black">
                  가입 유형
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleJoinDragEnd}
                >
                  <SortableContext items={joinItems.map(item => item.id)} strategy={verticalListSortingStrategy}>
                    <div className="space-y-2">
                      {joinItems.map((item) => (
                        <SortableItem key={item.id} id={item.id}>
                          <div className="flex items-center justify-between border border-gray-200 rounded-md bg-white hover:bg-gray-50 cursor-move">
                            <div className="flex items-center gap-2">
                              <GripVertical className="w-6 h-4 text-gray-400" />
                              <span className={`text-sm px-2 py-1 rounded ${item.style}`}>{item.label}</span>
                            </div>
                            <div 
                              onMouseDown={(e) => e.stopPropagation()}
                              onTouchStart={(e) => e.stopPropagation()}
                              onPointerDown={(e) => e.stopPropagation()}
                              onClick={(e) => e.stopPropagation()}
                            >
                              <input 
                                type="number" 
                                placeholder="반복 횟수" 
                                value={item.value}
                                onChange={(e) => handleJoinValueChange(item.id, e.target.value)}
                                onMouseDown={(e) => e.stopPropagation()}
                                onTouchStart={(e) => e.stopPropagation()}
                                onPointerDown={(e) => e.stopPropagation()}
                                onClick={(e) => e.stopPropagation()}
                                className="w-24 h-8 px-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                            </div>
                          </div>
                        </SortableItem>
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>
              </CardContent>
            </Card>
          </div>

          {/* 하단 가로로 긴 카드 2개 */}
          <div className="space-y-4">
            <Card className="w-full h-54">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold text-black">
                  요금제 분류
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {/* 1행: 큰 입력창 + 작은 입력창 */}
                  <div className="flex gap-2">
                    <textarea 
                      placeholder="탭으로 구분된 요금제 목록을 붙여넣으세요" 
                      value={planMainInput}
                      onChange={(e) => setPlanMainInput(e.target.value)}
                      onPaste={handlePlanPaste}
                      className="flex-1 h-8 px-2 py-1 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 resize-none"
                    />
                    <input 
                      type="number" 
                      placeholder="반복 횟수" 
                      value={planRepeatCount}
                      onChange={(e) => setPlanRepeatCount(e.target.value)}
                      className="w-24 h-8 px-3 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  {/* 2행: 입력창 4개 */}
                  <div className="grid grid-cols-4 gap-2">
                    {planSubInputs.slice(0, 4).map((value, index) => (
                      <input 
                        key={index}
                        type="text" 
                        placeholder={`입력창 ${index + 1}`}
                        value={value}
                        onChange={(e) => handlePlanSubInputChange(index, e.target.value)}
                        className="h-8 px-3 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    ))}
                  </div>
                  
                  {/* 3행: 입력창 4개 */}
                  <div className="grid grid-cols-4 gap-2">
                    {planSubInputs.slice(4, 8).map((value, index) => (
                      <input 
                        key={index + 4}
                        type="text" 
                        placeholder={`입력창 ${index + 5}`}
                        value={value}
                        onChange={(e) => handlePlanSubInputChange(index + 4, e.target.value)}
                        className="h-8 px-3 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="w-full h-54">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold text-black">
                  업체명 분류
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {/* 1행: 큰 입력창 + 작은 입력창 */}
                  <div className="flex gap-2">
                    <textarea 
                      placeholder="탭으로 구분된 업체명 목록을 붙여넣으세요" 
                      value={companyMainInput}
                      onChange={(e) => setCompanyMainInput(e.target.value)}
                      onPaste={handleCompanyPaste}
                      className="flex-1 h-8 px-3 py-1 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 resize-none"
                    />
                    <input 
                      type="number" 
                      placeholder="반복 횟수" 
                      value={companyRepeatCount}
                      onChange={(e) => setCompanyRepeatCount(e.target.value)}
                      className="w-24 h-8 px-3 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  {/* 2행: 입력창 4개 */}
                  <div className="grid grid-cols-4 gap-2">
                    {companySubInputs.slice(0, 4).map((value, index) => (
                      <input 
                        key={index}
                        type="text" 
                        placeholder={`입력창 ${index + 1}`}
                        value={value}
                        onChange={(e) => handleCompanySubInputChange(index, e.target.value)}
                        className="h-8 px-3 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    ))}
                  </div>
                  
                  {/* 3행: 입력창 4개 */}
                  <div className="grid grid-cols-4 gap-2">
                    {companySubInputs.slice(4, 8).map((value, index) => (
                      <input 
                        key={index + 4}
                        type="text" 
                        placeholder={`입력창 ${index + 5}`}
                        value={value}
                        onChange={(e) => handleCompanySubInputChange(index + 4, e.target.value)}
                        className="h-8 px-3 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* 하단 버튼 영역 */}
        <div className="flex justify-between gap-3 border-gray-200">
          <Button 
            className={`${BUTTON_THEME.danger_fill}`}
            onClick={handleReset}
          >
            초기화
          </Button>
          <Button 
            className={`${BUTTON_THEME.primary}`}
            onClick={handleApply}
          >
            적용
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
} 