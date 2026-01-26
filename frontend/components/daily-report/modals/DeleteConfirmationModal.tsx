"use client";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isDeleting: boolean;
}

export default function DeleteModal({ isOpen, onClose, onConfirm, isDeleting }: Props) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
        
        <div className="p-6 text-center">
            {/* Іконка кошика */}
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🗑️</span>
            </div>

            <h3 className="text-xl font-bold text-slate-800 mb-2">Видалити запис?</h3>
            <p className="text-sm text-slate-500 mb-6">
                Ви впевнені, що хочете видалити цей запис? <br/>
                Цю дію <span className="font-bold text-red-500">неможливо відмінити</span>.
            </p>

            <div className="flex gap-3">
                <button 
                    onClick={onClose} 
                    disabled={isDeleting}
                    className="flex-1 h-[45px] rounded-xl font-bold text-sm text-slate-600 bg-slate-100 hover:bg-slate-200 transition"
                >
                    Скасувати
                </button>
                
                <button 
                    onClick={onConfirm} 
                    disabled={isDeleting}
                    className="flex-1 h-[45px] rounded-xl font-bold text-sm text-white bg-red-500 hover:bg-red-600 shadow-lg shadow-red-200 transition flex items-center justify-center gap-2"
                >
                    {isDeleting ? "Видалення..." : "Так, видалити"}
                </button>
            </div>
        </div>

      </div>
    </div>
  );
}