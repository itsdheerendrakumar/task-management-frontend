import { useQuery } from '@tanstack/react-query'
import { getActivity } from "@/services/activity"
import { useGetProfile } from '@/hooks/useGetProfile';
import { queryKeys } from '@/constants/query-keys';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import OverlayLoader, { SectionLoader } from '@/features/Loader';
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { useState } from 'react';
import { useParticipantQuery } from '@/hooks/useParticipantQuery';
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from '@/components/ui/pagination';

function getPaginationItems(currentPage: number, totalPages: number) {
    const pages = new Set<number>();

    for (let pageNumber = 1; pageNumber <= Math.min(3, totalPages); pageNumber++) {
        pages.add(pageNumber);
    }

    for (
        let pageNumber = Math.max(1, currentPage - 1);
        pageNumber <= Math.min(totalPages, currentPage + 1);
        pageNumber++
    ) {
        pages.add(pageNumber);
    }

    for (
        let pageNumber = Math.max(1, totalPages - 2);
        pageNumber <= totalPages;
        pageNumber++
    ) {
        pages.add(pageNumber);
    }

    const sortedPages = Array.from(pages).sort((a, b) => a - b);
    const items: (number | 'ellipsis')[] = [];

    sortedPages.forEach((pageNumber, index) => {
        if (index > 0 && pageNumber - sortedPages[index - 1] > 1) {
            items.push('ellipsis');
        }
        items.push(pageNumber);
    });

    return items;
}

export function Activity() {
    const {participantsQuery} = useParticipantQuery(["admin"]);
    const [userId, setUserId] = useState<string>("");
    const [limit, setLimit] = useState("10");
    const [page, setPage] = useState(1);
    const { } = useGetProfile();
    const activityQuery = useQuery({
        queryKey: [queryKeys.activity, page, limit, userId],
        queryFn: () => getActivity({ limit, page, userId }),
        refetchOnWindowFocus: false
    });

    const pagination = activityQuery.data?.data?.pagination;
    const totalPages = pagination?.totalPages ?? 1;
    const paginationItems = getPaginationItems(page, totalPages);

    return (
        <Card>
            <CardHeader className="flex items-center justify-between gap-4 flex-wrap">
                <CardTitle>Activity Log</CardTitle>
                <Select value={userId} onValueChange={(value) => { setUserId(value); setPage(1); }} disabled={activityQuery.isFetching}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Select User" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectGroup>
                                {participantsQuery?.data?.data?.map((user) => (
                                    <SelectItem key={user.id} value={user.id.toString()} className="text-sm text-center">
                                        {user?.name + " (" + user.role + ")"}
                                    </SelectItem>
                                ))}
                            </SelectGroup>
                        </SelectContent>
                    </Select>
            </CardHeader>

            <CardContent className="p-0 relative">
                {activityQuery.isFetching && !activityQuery.isLoading &&
                    <OverlayLoader />
                }
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-40">Action</TableHead>
                            <TableHead>Message</TableHead>
                            <TableHead className="w-40">Performed By</TableHead>
                            <TableHead className="w-48">Created At</TableHead>
                        </TableRow>
                    </TableHeader>

                    <TableBody>
                        {activityQuery.isLoading && (
                            <TableRow>
                                <TableCell colSpan={4}>
                                    <SectionLoader />
                                </TableCell>
                            </TableRow>
                        )}

                        {activityQuery.isSuccess &&
                            activityQuery.data?.data?.data?.map((activity) => (
                                <TableRow key={activity.id}>
                                    <TableCell>
                                        <Badge variant="outline">
                                            {activity.action
                                                .replaceAll("_", " ")
                                                .toUpperCase()}
                                        </Badge>
                                    </TableCell>

                                    <TableCell>
                                        <p className="font-medium">
                                            {activity.message}
                                        </p>
                                    </TableCell>

                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            {activity.user?.profile_image && (
                                                <img
                                                    src={activity.user.profile_image}
                                                    alt={activity.user.name ?? ""}
                                                    className="w-6 h-6 rounded-full object-cover"
                                                />
                                            )}
                                            <span>{activity.user?.name ?? "Unknown"}</span>
                                        </div>
                                    </TableCell>

                                    <TableCell className="text-muted-foreground">
                                        {format(
                                            new Date(activity.created_at),
                                            "dd MMM yyyy, hh:mm a"
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}

                        {activityQuery.isSuccess &&
                            activityQuery.data?.data?.data?.length === 0 && (
                                <TableRow>
                                    <TableCell
                                        colSpan={4}
                                        className="h-24 text-center text-muted-foreground"
                                    >
                                        No activity found.
                                    </TableCell>
                                </TableRow>
                            )}
                    </TableBody>
                </Table>
                {activityQuery.isSuccess && 
                <div className="flex items-center justify-between mt-4 px-4 pb-4">
                    <Select value={limit} onValueChange={(value) => { setLimit(value); setPage(1); }}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Rows per page" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectGroup>
                                {["10", "20", "30"].map((pageSize) => (
                                    <SelectItem key={pageSize} value={pageSize} className="text-sm text-center">
                                        {pageSize}
                                    </SelectItem>
                                ))}
                            </SelectGroup>
                        </SelectContent>
                    </Select>

                    <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">
                            Page {page} of {totalPages}
                        </span>
                        <Pagination className="mx-0 w-auto justify-end">
                            <PaginationContent>
                                <PaginationItem>
                                    <PaginationPrevious
                                        href="#"
                                        aria-disabled={page <= 1 || activityQuery.isFetching}
                                        tabIndex={page <= 1 || activityQuery.isFetching ? -1 : undefined}
                                        className={page <= 1 || activityQuery.isFetching ? "pointer-events-none opacity-50" : ""}
                                        onClick={(event) => {
                                            event.preventDefault();
                                            if (!activityQuery.isFetching && page > 1) {
                                                setPage((currentPage) => currentPage - 1);
                                            }
                                        }}
                                    />
                                </PaginationItem>
                                {paginationItems.map((item, index) => (
                                    <PaginationItem key={`${item}-${index}`}>
                                        {item === 'ellipsis' ? (
                                            <PaginationEllipsis />
                                        ) : (
                                            <PaginationLink
                                                href="#"
                                                isActive={item === page}
                                                aria-label={`Go to page ${item}`}
                                                aria-disabled={activityQuery.isFetching}
                                                tabIndex={activityQuery.isFetching ? -1 : undefined}
                                                onClick={(event) => {
                                                    event.preventDefault();
                                                    if (!activityQuery.isFetching) {
                                                        setPage(item);
                                                    }
                                                }}
                                            >
                                                {item}
                                            </PaginationLink>
                                        )}
                                    </PaginationItem>
                                ))}
                                <PaginationItem>
                                    <PaginationNext
                                        href="#"
                                        aria-disabled={page >= totalPages || activityQuery.isFetching}
                                        tabIndex={page >= totalPages || activityQuery.isFetching ? -1 : undefined}
                                        className={page >= totalPages || activityQuery.isFetching ? "pointer-events-none opacity-50" : ""}
                                        onClick={(event) => {
                                            event.preventDefault();
                                            if (!activityQuery.isFetching && page < totalPages) {
                                                setPage((currentPage) => currentPage + 1);
                                            }
                                        }}
                                    />
                                </PaginationItem>
                            </PaginationContent>
                        </Pagination>
                    </div>
                </div>
                }
            </CardContent>
        </Card>

    );
}