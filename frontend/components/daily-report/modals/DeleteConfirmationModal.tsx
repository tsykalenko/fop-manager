"use client";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void; // Тепер тут тільки одна дія — видалити
  isDeleting: boolean;
}

export default function DeleteConfirmationModal({ isOpen, onClose, onConfirm, isDeleting }: Props) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Іконка та Заголовок */}
        <div className="p-6 text-center">
            <div className="w-14 h-14 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🗑️</span>
            </div>
            <h3 className="text-lg font-bold text-slate-900">Видалити запис?</h3>
            <p className="text-sm text-slate-500 mt-2 leading-relaxed">
                Ви збираєтесь видалити цей запис назавжди.<br/>
                <span className="font-semibold text-red-500">Цю дію неможливо скасувати.</span>
            </p>
        </div>

        {/* Кнопки */}
        <div className="p-4 bg-slate-50 flex gap-3 border-t border-slate-100">
            <button 
                onClick={onClose}
                disabled={isDeleting}
                className="flex-1 px-4 py-2.5 bg-white border border-slate-200 text-slate-700 font-bold rounded-lg hover:bg-slate-100 hover:text-slate-900 transition shadow-sm"
            >
                Скасувати
            </button>
            
            <button 
                onClick={onConfirm}
                disabled={isDeleting}
                className="flex-1 px-4 py-2.5 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 transition shadow-sm flex items-center justify-center gap-2"
            >
                {isDeleting ? "Видалення..." : "Видалити"}
            </button>
        </div>
      </div>
    </div>
  );
}