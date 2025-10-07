import { Bookmark, CreateBookmarkDto } from "@/types/bookmark";
import { api } from "../axios";
import { getAuthHeaders } from "../auth";



export async function createBookmark(payload: CreateBookmarkDto): Promise<Bookmark>{
    const { data } = await api.post<Bookmark>('/bookmarks',payload,{
        headers: getAuthHeaders(),
    });
    return data;
}

export async function deleteBookmark(id: number | string): Promise<void>{
    await api.delete(`/bookmarks/${id}`, {
        headers: getAuthHeaders(),
    });
}

export async function getAllBookmarks(): Promise<Bookmark[]>{
    const { data } = await api.get<Bookmark[]>('/bookmarks', {
        headers: getAuthHeaders(),
    });
    return data;
}