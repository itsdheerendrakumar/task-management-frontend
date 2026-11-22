import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { MoreHorizontal, Plus } from "lucide-react";
import { CreateuserModal } from "@/features/users/CreatUserModal";
import { useState } from "react";
import { useGetProfile } from "@/hooks/useGetProfile";
import { getUsers } from "@/services/user";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/constants/query-keys";
import { SectionLoader } from "@/features/Loader";
import { ShowError } from "@/features/ShowError";

export function User() {
  const [isCreateUserModalOpen, setIsCreateUserModalOpen] = useState(false);
  const { profileQuery } = useGetProfile();
  const userListingQuery = useQuery({
    queryKey: [queryKeys.userListing, profileQuery.data?.data?.id],
    queryFn: getUsers,
  });
  return (
    <div className="w-full">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-4xl font-semibold tracking-tight">
            User management
          </h1>

          <p className="mt-1 sm:mt-2 text-muted-foreground text-sm sm:text-lg">
            Add teammates, manage roles, and revoke access.
          </p>
        </div>

        <Button
          size="lg"
          className="h-10 sm:h-12 rounded-xl px-4 sm:px-6 shadow-md w-full sm:w-auto"
          onClick={() => setIsCreateUserModalOpen(true)}
        >
          <Plus className="size-5" />
          Invite user
        </Button>
      </div>

      {userListingQuery.isLoading && <SectionLoader />}
      {userListingQuery.isError && <ShowError message="Failed to load users. Please try again." />}

      {userListingQuery.isSuccess &&
        <div className="overflow-x-auto rounded-lg border bg-card shadow-soft">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/20 hover:bg-muted/20">
                <TableHead className="font-semibold">
                  ID
                </TableHead>
                <TableHead className="font-semibold">
                  User
                </TableHead>
                <TableHead className="font-semibold">
                  Role
                </TableHead>
                <TableHead className="font-semibold">
                  Email
                </TableHead>
                <TableHead className="w-16" />
              </TableRow>
            </TableHeader>

            <TableBody>
              {userListingQuery?.data?.data?.map((user) => (
                <TableRow
                  key={user.email}
                  className="border-b last:border-b-0"
                >
                  <TableCell>
                    {user?.id}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-4">
                      <Avatar className="size-12 bg-indigo-100">
                        <AvatarFallback className="bg-indigo-100 text-indigo-600 font-medium">
                          {user?.name
                            .split(" ")
                            .map((n) => n[0])}
                        </AvatarFallback>
                      </Avatar>

                      <div>
                        <div className="font-semibold text-lg">
                          {user?.name}
                        </div>
                      </div>
                    </div>
                  </TableCell>

                  <TableCell>
                    <Badge
                      variant="secondary"
                      className="rounded-full px-4 py-1 text-sm font-medium"
                    >
                      {user?.role}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-base">
                    {user?.email}
                  </TableCell>

                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="rounded-full"
                    >
                      <MoreHorizontal className="size-5" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      }
      <CreateuserModal open={isCreateUserModalOpen} onOpenChange={setIsCreateUserModalOpen} />
    </div>
  );
}