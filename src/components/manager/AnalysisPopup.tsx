import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, X, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { SKU } from '@/types';

interface AnalysisPopupProps {
    isOpen: boolean;
    onClose: () => void;
    missingSKUs: SKU[];
    salesmanName: string;
}

const AnalysisPopup: React.FC<AnalysisPopupProps> = ({ isOpen, onClose, missingSKUs, salesmanName }) => {
    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    className="w-full max-w-sm"
                >
                    <Card className="overflow-hidden border-0 shadow-2xl bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
                        {/* Header */}
                        <div className="bg-gradient-to-r from-amber-500 to-orange-600 p-6 text-white text-center">
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: "spring", stiffness: 200, damping: 15 }}
                                className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center mx-auto mb-4"
                            >
                                <AlertCircle size={32} className="text-white" />
                            </motion.div>
                            <h2 className="text-2xl font-bold mb-1">Sales Analysis</h2>
                            <p className="text-white/80 text-sm">Action Required for {salesmanName}</p>
                        </div>

                        {/* Content */}
                        <div className="p-6">
                            <p className="text-center text-muted-foreground mb-6">
                                This DS has <span className="font-bold text-amber-600 dark:text-amber-500">not billed</span> the following SKUs in the last 3 days:
                            </p>

                            <div className="space-y-3 mb-8 max-h-60 overflow-y-auto pr-1 custom-scrollbar">
                                {missingSKUs.map((sku, index) => (
                                    <motion.div
                                        key={sku.id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                        className="flex items-center gap-3 p-3 rounded-xl bg-muted/50 border border-border/50"
                                    >
                                        <div className="w-10 h-10 rounded-lg overflow-hidden bg-white shrink-0 shadow-sm">
                                            <img src={sku.imageUrl} alt={sku.name} className="w-full h-full object-cover" />
                                        </div>
                                        <span className="font-medium text-sm text-foreground">{sku.name}</span>
                                    </motion.div>
                                ))}
                            </div>

                            <div className="space-y-3">
                                <Button
                                    className="w-full h-12 text-lg font-bold bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 shadow-lg shadow-orange-500/20"
                                    onClick={onClose}
                                >
                                    Message Understood
                                    <ChevronRight className="ml-2" size={20} />
                                </Button>

                                <p className="text-xs text-center text-muted-foreground">
                                    Please ensure these SKUs are prioritized during today's market visit.
                                </p>
                            </div>
                        </div>
                    </Card>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default AnalysisPopup;
