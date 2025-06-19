import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, ListFilter } from 'lucide-react';

const BoardFilterBar = () => {
  return (
    <div className="mb-6 flex flex-col sm:flex-row items-center gap-4 p-4 bg-gradient-to-br from-blue-50 to-white border border-blue-100 rounded-lg shadow-sm">
      <div className="relative flex-grow w-full sm:w-auto">
        <Input 
          type="text" 
          placeholder="게시글 검색..." 
          className="pl-10 border-blue-200 focus:border-blue-400 focus:ring-blue-400/20 bg-white/50" 
        />
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-blue-500" />
      </div>
      <div className="flex gap-2 w-full sm:w-auto">
        <Select defaultValue="latest">
          <SelectTrigger className="w-full sm:w-[180px] border-blue-200 focus:border-blue-400 focus:ring-blue-400/20 bg-white/50">
            <SelectValue placeholder="정렬 기준" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="latest">최신순</SelectItem>
            <SelectItem value="views">조회순</SelectItem>
            <SelectItem value="likes">추천순</SelectItem>
          </SelectContent>
        </Select>
        <Button 
          variant="outline" 
          className="w-full sm:w-auto border-blue-200 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300"
        >
          <ListFilter className="mr-2 h-4 w-4 text-blue-500" />
          필터
        </Button>
      </div>
    </div>
  );
};

export default BoardFilterBar;
