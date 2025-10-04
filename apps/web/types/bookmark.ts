export interface Bookmark {
  id: number;
  accountId: number;    
  postId: number;        
  createdAt: string;     
}

export interface CreateBookmarkDto {
  postId: number;       
}