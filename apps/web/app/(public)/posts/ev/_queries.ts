import { useQuery } from '@tanstack/react-query';
import { getPostById, getAccountById } from '@/lib/api';
import { adaptPostDto } from '@/lib/adapters/post';
import { adaptAccountDto } from '@/lib/adapters/account';

/**
 * Hook to fetch and adapt a single post by ID
 * @param id Post ID
 * @returns TanStack Query result with adapted PostUI data
 */
export function usePost(id: string) {
  return useQuery({
    queryKey: ['post', id] as const,
    queryFn: () => getPostById(id),
    select: adaptPostDto,
    enabled: !!id,
    staleTime: 60_000, // 1 minute
    retry: 2,
  });
}

/**
 * Hook to fetch and adapt a single account by ID
 * @param id Account ID (string or number)
 * @returns TanStack Query result with adapted AccountUI data
 */
export function useAccount(id: string | number) {
  return useQuery({
    queryKey: ['account', id] as const,
    queryFn: () => getAccountById(id),
    select: adaptAccountDto,
    enabled: !!id,
    staleTime: 5 * 60_000, // 5 minutes (user data changes less frequently)
    retry: 2,
  });
}
