import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { userService } from "@/services/userService";
import { User } from "@/types";
import { Search, RotateCcw, Check, Loader2, KeyRound } from 'lucide-react';
import { toast } from "sonner";

interface UserManagementDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export const UserManagementDialog: React.FC<UserManagementDialogProps> = ({ open, onOpenChange }) => {
    const [users, setUsers] = useState<User[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [processingIds, setProcessingIds] = useState<Set<string>>(new Set());

    useEffect(() => {
        if (open) {
            setupUsers();
        }
    }, [open]);

    const setupUsers = async () => {
        setIsLoading(true);
        try {
            const allUsers = await userService.getAll();
            setUsers(allUsers.sort((a, b) => a.name.localeCompare(b.name)));
        } catch (error) {
            console.error('Failed to fetch users:', error);
            toast.error("Failed to load users");
        } finally {
            setIsLoading(false);
        }
    };

    const handleResetPassword = async (user: User) => {
        setProcessingIds(prev => new Set(prev).add(user.id));
        try {
            await userService.resetPassword(user.id, user.name);
            const defaultPass = user.name.substring(0, 3).toLowerCase();
            toast.success(`Password reset for ${user.name}`, {
                description: `New password: ${defaultPass}`
            });
        } catch (error) {
            console.error('Failed to reset password:', error);
            toast.error("Failed to reset password");
        } finally {
            setProcessingIds(prev => {
                const next = new Set(prev);
                next.delete(user.id);
                return next;
            });
        }
    };

    const filteredUsers = users.filter(user =>
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.role.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle>User Management</DialogTitle>
                    <DialogDescription>
                        Manage users and security settings.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex items-center gap-2 mb-4">
                    <Search className="w-4 h-4 text-muted-foreground" />
                    <Input
                        placeholder="Search users..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="flex-1"
                    />
                </div>

                {isLoading ? (
                    <div className="flex items-center justify-center p-8">
                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    </div>
                ) : (
                    <ScrollArea className="flex-1 pr-4">
                        <div className="space-y-2">
                            {filteredUsers.map(user => (
                                <div key={user.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                                    <div className="flex flex-col">
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium">{user.name}</span>
                                            <Badge variant={user.role === 'manager' ? 'default' : 'secondary'} className="text-[10px]">
                                                {user.role === 'manager' ? user.managerLevel || 'Manager' : user.role}
                                            </Badge>
                                        </div>
                                        <span className="text-xs text-muted-foreground">ID: {user.id.slice(0, 8)}...</span>
                                    </div>

                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleResetPassword(user)}
                                        disabled={processingIds.has(user.id)}
                                    >
                                        {processingIds.has(user.id) ? (
                                            <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                        ) : (
                                            <KeyRound className="w-4 h-4 mr-2" />
                                        )}
                                        Reset Password
                                    </Button>
                                </div>
                            ))}
                            {filteredUsers.length === 0 && (
                                <p className="text-center text-muted-foreground py-8">No users found.</p>
                            )}
                        </div>
                    </ScrollArea>
                )}
            </DialogContent>
        </Dialog>
    );
};
