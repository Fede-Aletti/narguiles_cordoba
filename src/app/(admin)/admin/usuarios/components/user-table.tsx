"use client";
import React from "react";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchUsersWithAuthEmail as fetchServerSideUsers,
  updateUser,
  deactivateUser,
  type UserWithAuthEmail as UserWithAuth,
  type UpdateUserPayload,
} from "@/actions/user-actions";
import { fetchClientSideUsers } from "@/lib/queries/user-queries";
import { UserForm } from "./user-form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Pencil, Trash2, ChevronDown, ChevronRight } from "lucide-react";
import { IUser } from "@/interfaces/user";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useAddressesByUserId } from "@/lib/queries/address-queries";
import type { IAddress } from "@/interfaces/address";
import { useFavoritesByUserId } from "@/lib/queries/favorite-queries";
import { useOrdersByUserId } from "@/lib/queries/order-queries";
import Link from "next/link";

interface UserRowDetailProps {
  userId: string;
}

function UserRowDetail({ userId }: UserRowDetailProps) {
  const { data: addresses, isLoading: isLoadingAddresses, error: addressesError } = useAddressesByUserId(userId);
  const { data: favorites, isLoading: isLoadingFavorites, error: favoritesError } = useFavoritesByUserId(userId);
  const { data: orders, isLoading: isLoadingOrders, error: ordersError } = useOrdersByUserId(userId);

  return (
    <div className="p-4 bg-muted/50 grid grid-cols-1 md:grid-cols-3 gap-6">
      <div>
        <h5 className="font-medium mb-2">Direcciones:</h5>
        {isLoadingAddresses && <p className="text-sm text-muted-foreground">Cargando...</p>}
        {addressesError && <p className="text-sm text-red-500">Error: {addressesError.message}</p>}
        {addresses && addresses.length > 0 ? (
          <ul className="list-disc pl-5 space-y-1 text-sm">
            {addresses.map(addr => (
              <li key={addr.id}>
                {addr.street} {addr.street_number}, {addr.city}
              </li>
            ))}
          </ul>
        ) : addresses ? (
          <p className="text-sm text-muted-foreground">No hay direcciones.</p>
        ) : null}
      </div>

      <div>
        <h5 className="font-medium mb-2">Favoritos:</h5>
        {isLoadingFavorites && <p className="text-sm text-muted-foreground">Cargando...</p>}
        {favoritesError && <p className="text-sm text-red-500">Error: {favoritesError.message}</p>}
        {favorites && favorites.length > 0 ? (
          <ul className="list-disc pl-5 space-y-1 text-sm">
            {favorites.map(fav => (
              <li key={fav.id}>
                <Link href={`/tienda/${fav.product?.slug}`} className="hover:underline text-blue-600">
                  {fav.product?.name || 'Producto no disponible'}
                </Link>
              </li>
            ))}
          </ul>
        ) : favorites ? (
          <p className="text-sm text-muted-foreground">No hay favoritos.</p>
        ) : null}
      </div>

      <div>
        <h5 className="font-medium mb-2">Órdenes Recientes:</h5>
        {isLoadingOrders && <p className="text-sm text-muted-foreground">Cargando...</p>}
        {ordersError && <p className="text-sm text-red-500">Error: {ordersError.message}</p>}
        {orders && orders.length > 0 ? (
          <ul className="list-disc pl-5 space-y-1 text-sm">
            {orders.slice(0, 5).map(order => ( // Mostramos solo las últimas 5
              <li key={order.id}>
                ID: {order.id.substring(0, 8)}... - ${order.total_amount} ({order.status_display})
              </li>
            ))}
          </ul>
        ) : orders ? (
          <p className="text-sm text-muted-foreground">No hay órdenes.</p>
        ) : null}
      </div>
    </div>
  );
}

interface UserTableProps {
  initialUsers: UserWithAuth[];
}

export function UserTable({ initialUsers }: UserTableProps) {
  const queryClient = useQueryClient();
  const [editUser, setEditUser] = useState<UserWithAuth | null>(null);
  const [deleteUser, setDeleteUser] = useState<UserWithAuth | null>(null);
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});

  const { data: users = [], isLoading } = useQuery<UserWithAuth[], Error>({
    queryKey: ["users"],
    queryFn: fetchClientSideUsers,
    initialData: initialUsers,
  });

  const updateMutation = useMutation<
    IUser,
    Error,
    { id: string; payload: UpdateUserPayload }
  >({
    mutationFn: (variables) => updateUser(variables.id, variables.payload),
    onSuccess: () => {
      toast.success("Usuario actualizado correctamente");
      queryClient.invalidateQueries({ queryKey: ["users"] });
      setEditUser(null);
    },
    onError: (error) => {
      toast.error(`Error al actualizar usuario: ${error.message}`);
    },
  });

  const deactivateMutation = useMutation<IUser, Error, string>({
    mutationFn: deactivateUser,
    onSuccess: () => {
      toast.success("Usuario desactivado correctamente");
      queryClient.invalidateQueries({ queryKey: ["users"] });
      setDeleteUser(null);
    },
    onError: (error) => {
      toast.error(`Error al desactivar usuario: ${error.message}`);
    },
  });

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "superadmin":
        return <Badge className="bg-blue-500">Admin</Badge>;
      case "admin":
        return <Badge className="bg-blue-500">Admin</Badge>;
      case "marketing":
        return <Badge className="bg-green-500">Marketing</Badge>;
      case "client":
        return <Badge className="bg-gray-500">Cliente</Badge>;
      default:
        return <Badge className="bg-gray-300">{role}</Badge>;
    }
  };

  const toggleRowExpansion = (userId: string) => {
    setExpandedRows(prev => ({ ...prev, [userId]: !prev[userId] }));
  };

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[40px]"></TableHead>
              <TableHead>Nombre</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Teléfono</TableHead>
              <TableHead>Rol</TableHead>
              <TableHead>Creado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center">
                  Cargando usuarios...
                </TableCell>
              </TableRow>
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center">
                  No hay usuarios
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <React.Fragment key={user.id}>
                  <TableRow>
                    <TableCell>
                      <Button variant="ghost" size="icon" onClick={() => toggleRowExpansion(user.id)} aria-label={expandedRows[user.id] ? "Colapsar fila" : "Expandir fila"}>
                        {expandedRows[user.id] ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                      </Button>
                    </TableCell>
                    <TableCell className="font-medium">
                      {user.first_name} {user.last_name}
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.phone_number || "No disponible"}</TableCell>
                    <TableCell>{getRoleBadge(user.role)}</TableCell>
                    <TableCell>
                      {new Date(user.created_at).toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          size="icon"
                          variant="outline"
                          onClick={() => setEditUser(user)}
                          aria-label="Editar usuario"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="outline"
                          className="text-red-500 hover:text-red-700"
                          onClick={() => setDeleteUser(user)}
                          aria-label="Desactivar usuario"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                  {expandedRows[user.id] && (
                    <TableRow>
                      <TableCell colSpan={7}>
                        <UserRowDetail userId={user.id} />
                      </TableCell>
                    </TableRow>
                  )}
                </React.Fragment>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog
        open={!!editUser}
        onOpenChange={(open) => !open && setEditUser(null)}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Editar Usuario</DialogTitle>
          </DialogHeader>
          {editUser && (
            <UserForm
              defaultValues={{
                email: editUser.email,
                first_name: editUser.first_name || "",
                last_name: editUser.last_name || "",
                phone_number: editUser.phone_number,
                role: editUser.role,
              }}
              onSubmit={(data) => {
                if (editUser?.id) {
                  const payload: UpdateUserPayload = {
                    first_name: data.first_name,
                    last_name: data.last_name,
                    phone_number: data.phone_number,
                    role: data.role,
                  };
                  updateMutation.mutate({ id: editUser.id, payload });
                }
              }}
              loading={updateMutation.isPending}
            />
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={!!deleteUser}
        onOpenChange={(open) => !open && setDeleteUser(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción desactivará al usuario {deleteUser?.first_name}{" "}
              {deleteUser?.last_name}({deleteUser?.email}). El usuario ya no
              podrá iniciar sesión.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                deleteUser && deactivateMutation.mutate(deleteUser.id)
              }
              className="bg-red-500 hover:bg-red-600"
            >
              {deactivateMutation.isPending ? "Desactivando..." : "Desactivar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
