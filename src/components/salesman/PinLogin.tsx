import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, ChevronDown, AlertCircle, Users, Briefcase, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { userService } from '@/services/userService';
import { User as UserType } from '@/types';

interface PinLoginProps {
    onSuccess: () => void;
    allowedRoles?: ('team_leader' | 'manager')[];
}

type RoleType = 'manager' | 'team_leader';

const PinLogin: React.FC<PinLoginProps> = ({
    onSuccess,
    allowedRoles = ['team_leader', 'manager']
}) => {
    const { loginByName, rememberedUsers } = useAuth();
    const [selectedRoleType, setSelectedRoleType] = useState<RoleType | null>(null);
    const [selectedName, setSelectedName] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [showNameDropdown, setShowNameDropdown] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingUsers, setIsLoadingUsers] = useState(false);
    const [availableUsers, setAvailableUsers] = useState<UserType[]>([]);

    // Fetch users when role type changes
    useEffect(() => {
        const fetchUsers = async () => {
            if (!selectedRoleType) {
                setAvailableUsers([]);
                return;
            }

            setIsLoadingUsers(true);
            try {
                if (selectedRoleType === 'manager') {
                    const managers = await userService.getManagers();
                    setAvailableUsers(managers);
                } else {
                    const teamLeaders = await userService.getTeamLeaders();
                    setAvailableUsers(teamLeaders);
                }
            } catch (err) {
                console.error('Failed to fetch users:', err);
                setError('Failed to load users. Please try again.');
            } finally {
                setIsLoadingUsers(false);
            }
        };

        setPassword('');
        fetchUsers();
    }, [selectedRoleType]);

    // Sort users alphabetically
    const sortedUsers = useMemo(() => {
        return [...availableUsers].sort((a, b) => a.name.localeCompare(b.name));
    }, [availableUsers]);

    // Filter by allowed roles
    const showManagerOption = allowedRoles.includes('manager');
    const showTeamLeaderOption = allowedRoles.includes('team_leader');

    const handleRoleSelect = (roleType: RoleType) => {
        setSelectedRoleType(roleType);
        setSelectedName('');
        setError(null);
    };

    const handleNameSelect = (name: string) => {
        setSelectedName(name);
        setPassword('');
        setShowNameDropdown(false);
        setError(null);
    };

    const handleLogin = async () => {
        if (!selectedRoleType) {
            setError('Please select your role first');
            return;
        }
        if (!selectedName) {
            setError('Please select your name');
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const user = await loginByName(selectedName, selectedRoleType, password);
            if (user) {
                onSuccess();
            } else {
                setError('Invalid credentials. Please check name and password.');
            }
        } catch (err) {
            console.error('Login failed:', err);
            setError('Login failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    // Role selection step
    if (!selectedRoleType) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="w-full max-w-sm"
                >
                    <Card className="p-6 shadow-2xl backdrop-blur-sm bg-white/95 dark:bg-gray-900/95">
                        {/* Logo/Header */}
                        <div className="text-center mb-8">
                            <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
                                <User className="w-10 h-10 text-white" />
                            </div>
                            <h1 className="text-2xl font-bold text-foreground">Sales Blitz</h1>
                            <p className="text-sm text-muted-foreground mt-2">
                                Who are you?
                            </p>
                        </div>

                        <div className="space-y-4">
                            {/* AE/AM Option */}
                            {showManagerOption && (
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => handleRoleSelect('manager')}
                                    className="w-full p-4 rounded-xl border-2 border-transparent bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 hover:border-emerald-500 transition-all flex items-center gap-4"
                                >
                                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-md">
                                        <Briefcase className="w-7 h-7 text-white" />
                                    </div>
                                    <div className="text-left flex-1">
                                        <p className="font-bold text-lg text-foreground">AE / AM</p>
                                        <p className="text-sm text-muted-foreground">Area Executive / Area Manager</p>
                                    </div>
                                    <ChevronDown className="w-5 h-5 text-muted-foreground rotate-[-90deg]" />
                                </motion.button>
                            )}

                            {/* Team Leader Option */}
                            {showTeamLeaderOption && (
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => handleRoleSelect('team_leader')}
                                    className="w-full p-4 rounded-xl border-2 border-transparent bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30 hover:border-indigo-500 transition-all flex items-center gap-4"
                                >
                                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-md">
                                        <Users className="w-7 h-7 text-white" />
                                    </div>
                                    <div className="text-left flex-1">
                                        <p className="font-bold text-lg text-foreground">Team Leader</p>
                                        <p className="text-sm text-muted-foreground">Manage your sales team</p>
                                    </div>
                                    <ChevronDown className="w-5 h-5 text-muted-foreground rotate-[-90deg]" />
                                </motion.button>
                            )}
                        </div>
                    </Card>
                </motion.div>
            </div>
        );
    }

    // Name selection step
    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-sm"
            >
                <Card className="p-6 shadow-2xl backdrop-blur-sm bg-white/95 dark:bg-gray-900/95">
                    {/* Header with back button */}
                    <div className="flex items-center gap-3 mb-6">
                        <button
                            onClick={() => {
                                setSelectedRoleType(null);
                                setSelectedName('');
                                setError(null);
                            }}
                            className="p-2 rounded-lg hover:bg-muted transition-colors"
                        >
                            <ChevronDown className="w-5 h-5 rotate-90 text-muted-foreground" />
                        </button>
                        <div>
                            <p className="text-sm text-muted-foreground">
                                {selectedRoleType === 'manager' ? 'AE / AM Login' : 'Team Leader Login'}
                            </p>
                            <h2 className="text-xl font-bold text-foreground">Select Your Name</h2>
                        </div>
                    </div>

                    <div className="space-y-4">
                        {/* Name Dropdown */}
                        <div className="relative">
                            <button
                                type="button"
                                onClick={() => setShowNameDropdown(!showNameDropdown)}
                                disabled={isLoadingUsers}
                                className="w-full p-4 rounded-xl border-2 bg-background hover:border-primary/50 transition-all flex items-center justify-between text-left disabled:opacity-50"
                            >
                                <div className="flex items-center gap-3">
                                    {isLoadingUsers ? (
                                        <div className="w-10 h-10 rounded-full flex items-center justify-center bg-muted">
                                            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                                        </div>
                                    ) : (
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${selectedRoleType === 'manager'
                                            ? 'bg-gradient-to-br from-emerald-500 to-teal-600'
                                            : 'bg-gradient-to-br from-indigo-500 to-purple-600'
                                            }`}>
                                            {selectedName ? selectedName.charAt(0).toUpperCase() : '?'}
                                        </div>
                                    )}
                                    <span className={`font-medium ${selectedName ? 'text-foreground' : 'text-muted-foreground'}`}>
                                        {isLoadingUsers ? 'Loading...' : (selectedName || 'Choose your name...')}
                                    </span>
                                </div>
                                <ChevronDown className={`w-5 h-5 text-muted-foreground transition-transform ${showNameDropdown ? 'rotate-180' : ''}`} />
                            </button>

                            {/* Dropdown List */}
                            <AnimatePresence>
                                {showNameDropdown && !isLoadingUsers && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className="absolute z-10 w-full mt-2 bg-background border rounded-xl shadow-lg max-h-64 overflow-y-auto"
                                    >
                                        {sortedUsers.length === 0 ? (
                                            <div className="p-4 text-center text-muted-foreground">
                                                No users found
                                            </div>
                                        ) : (
                                            sortedUsers.map((user) => (
                                                <button
                                                    key={user.id}
                                                    onClick={() => handleNameSelect(user.name)}
                                                    className="w-full px-4 py-3 text-left hover:bg-muted transition-colors flex items-center gap-3 border-b last:border-b-0"
                                                >
                                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${selectedRoleType === 'manager'
                                                        ? 'bg-gradient-to-br from-emerald-500 to-teal-600'
                                                        : 'bg-gradient-to-br from-indigo-500 to-purple-600'
                                                        }`}>
                                                        {user.name.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-sm text-foreground">{user.name}</p>
                                                        {user.managerLevel && (
                                                            <p className="text-xs text-muted-foreground">{user.managerLevel}</p>
                                                        )}
                                                    </div>
                                                </button>
                                            ))
                                        )}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Password Input - Only for Managers */}
                        <AnimatePresence>
                            {selectedName && selectedRoleType === 'manager' && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    className="space-y-1"
                                >
                                    <label className="text-xs text-muted-foreground font-medium ml-1">Password</label>
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => {
                                            setPassword(e.target.value);
                                            setError(null);
                                        }}
                                        className="w-full p-4 rounded-xl border-2 bg-background hover:border-primary/50 focus:border-primary focus:outline-none transition-all"
                                        placeholder="Enter password"
                                    />
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Error */}
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="flex items-center gap-2 text-destructive text-sm p-3 bg-destructive/10 rounded-lg"
                            >
                                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                                <span>{error}</span>
                            </motion.div>
                        )}

                        {/* Login Button */}
                        <Button
                            onClick={handleLogin}
                            className={`w-full h-12 text-lg font-semibold ${selectedRoleType === 'manager'
                                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700'
                                : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700'
                                }`}
                            disabled={!selectedName || isLoading}
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                    Logging in...
                                </>
                            ) : (
                                'Continue'
                            )}
                        </Button>

                        {/* User count info */}
                        <div className="text-center pt-2">
                            <p className="text-xs text-muted-foreground">
                                {isLoadingUsers ? 'Loading...' : `${sortedUsers.length} ${selectedRoleType === 'manager' ? 'AEs/AMs' : 'Team Leaders'} available`}
                            </p>
                        </div>
                    </div>
                </Card>
            </motion.div>
        </div>
    );
};

export default PinLogin;
