"use client";

import { DataSet } from '@/types/dashboard';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { X, GripVertical } from 'lucide-react';
import { BUTTON_THEME, CONTRACT_OPTIONS, JOIN_TYPE_OPTIONS } from '@/styles/common';
import { useState } from 'react';
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

  const handleCarrierChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCarrier(e.target.value);
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
                  className={`w-32 h-8 px-6 text-sm font-bold border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
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
                              <input 
                                type="number" 
                                placeholder="반복 횟수" 
                                value={item.value}
                                onChange={(e) => handleSupportValueChange(item.id, e.target.value)}
                                className="w-24 h-8 px-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
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
                            <input 
                              type="number" 
                              placeholder="반복 횟수" 
                              value={item.value}
                              onChange={(e) => handleJoinValueChange(item.id, e.target.value)}
                              className="w-24 h-8 px-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
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
                    <input 
                      type="text" 
                      placeholder="큰 입력창" 
                      className="flex-1 h-8 px-3 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input 
                      type="number" 
                      placeholder="반복 횟수" 
                      className="w-24 h-8 px-3 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  {/* 2행: 입력창 4개 */}
                  <div className="grid grid-cols-4 gap-2">
                    <input 
                      type="text" 
                      placeholder="입력창 1" 
                      className="h-8 px-3 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input 
                      type="text" 
                      placeholder="입력창 2" 
                      className="h-8 px-3 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input 
                      type="text" 
                      placeholder="입력창 3" 
                      className="h-8 px-3 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input 
                      type="text" 
                      placeholder="입력창 4" 
                      className="h-8 px-3 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  {/* 3행: 입력창 4개 */}
                  <div className="grid grid-cols-4 gap-2">
                    <input 
                      type="text" 
                      placeholder="입력창 5" 
                      className="h-8 px-3 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input 
                      type="text" 
                      placeholder="입력창 6" 
                      className="h-8 px-3 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input 
                      type="text" 
                      placeholder="입력창 7" 
                      className="h-8 px-3 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input 
                      type="text" 
                      placeholder="입력창 8" 
                      className="h-8 px-3 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
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
                    <input 
                      type="text" 
                      placeholder="큰 입력창" 
                      className="flex-1 h-8 px-3 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input 
                      type="number" 
                      placeholder="반복 횟수" 
                      className="w-24 h-8 px-3 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  {/* 2행: 입력창 4개 */}
                  <div className="grid grid-cols-4 gap-2">
                    <input 
                      type="text" 
                      placeholder="입력창 1" 
                      className="h-8 px-3 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input 
                      type="text" 
                      placeholder="입력창 2" 
                      className="h-8 px-3 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input 
                      type="text" 
                      placeholder="입력창 3" 
                      className="h-8 px-3 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input 
                      type="text" 
                      placeholder="입력창 4" 
                      className="h-8 px-3 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  {/* 3행: 입력창 4개 */}
                  <div className="grid grid-cols-4 gap-2">
                    <input 
                      type="text" 
                      placeholder="입력창 5" 
                      className="h-8 px-3 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input 
                      type="text" 
                      placeholder="입력창 6" 
                      className="h-8 px-3 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input 
                      type="text" 
                      placeholder="입력창 7" 
                      className="h-8 px-3 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input 
                      type="text" 
                      placeholder="입력창 8" 
                      className="h-8 px-3 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* 하단 버튼 영역 */}
        <div className="flex justify-end gap-3 border-gray-200">
          <Button 
            className={`${BUTTON_THEME.gray}`}
            onClick={onClose}
          >
            닫기
          </Button>
          <Button 
            className={`${BUTTON_THEME.primary}`}
            onClick={() => {
              // 적용 로직 구현 예정
              console.log('적용 버튼 클릭');
            }}
          >
            적용
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
} 