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
import { Button } from '@/components/ui/button';

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
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPage((p) => Math.max(1, p - 1))}
                            disabled={page <= 1 || activityQuery.isFetching}
                        >
                            Previous
                        </Button>
                        <span className="text-sm text-muted-foreground">
                            Page {page} of {totalPages}
                        </span>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPage((p) => p + 1)}
                            disabled={page >= totalPages || activityQuery.isFetching}
                        >
                            Next
                        </Button>
                    </div>
                </div>
                }
            </CardContent>
        </Card>

    );
}