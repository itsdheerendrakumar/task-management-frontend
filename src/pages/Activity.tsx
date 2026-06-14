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
import ReactPaginate from 'react-paginate';
import { useParticipantQuery } from '@/hooks/useParticipantQuery';
console.log(ReactPaginate)
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
    return (
        <Card>
            <CardHeader className="flex items-center justify-between gap-4 flex-wrap">
                <CardTitle>Activity Log</CardTitle>
                <Select value={userId} onValueChange={setUserId} disabled={activityQuery.isFetching}>
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
                            <TableHead className="w-32">User ID</TableHead>
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
                                        {activity.performed_by}
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
                <div className="flex items-center justify-between mt-4 px-4">
                    <Select value={limit} onValueChange={setLimit}>
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

                    <p>Current Page: {page}</p>

                    {/* <ReactPaginate
                        breakLabel="..."
                        nextLabel="Next >"
                        previousLabel="< Previous"
                        pageCount={10}
                        pageRangeDisplayed={5}
                        marginPagesDisplayed={2}
                        onPageChange={(selectedItem) => {
                            setPage(selectedItem.selected + 1);
                        }}
                        forcePage={page - 1}
                        renderOnZeroPageCount={null}
                        containerClassName="flex items-center justify-center gap-2 mt-4"
                        pageClassName="border rounded px-3 py-1 cursor-pointer"
                        activeClassName="bg-primary text-primary-foreground"
                        previousClassName="border rounded px-3 py-1 cursor-pointer"
                        nextClassName="border rounded px-3 py-1 cursor-pointer"
                        breakClassName="px-2"
                    /> */}
                </div>
                }
            </CardContent>
        </Card>

    );
}