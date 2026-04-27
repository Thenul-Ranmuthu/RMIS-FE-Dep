// RMIS/files/components/quota-requests/QuotaPagination.tsx

interface QuotaPaginationProps {
    currentPage: number;
    totalCount: number;
    totalPages: number;
    pageSize: number;
    onPageChange: (page: number) => void;
    onPageSizeChange: (pageSize: number) => void;
}

export default function QuotaPagination({
    currentPage,
    totalCount,
    totalPages,
    pageSize,
    onPageChange,
    onPageSizeChange,
}: QuotaPaginationProps) {
    //const totalPages = pageSize > 0 ? Math.ceil(totalCount / pageSize) : 1;
    const from = (currentPage - 1) * pageSize + 1;
    const to = Math.min(currentPage * pageSize, totalCount);

    // Build page number array e.g. [1, 2, 3, '...', 8, 9, 10]
    const getPageNumbers = (): (number | '...')[] => {
        if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
        if (currentPage <= 4) return [1, 2, 3, 4, 5, '...', totalPages];
        if (currentPage >= totalPages - 3) return [1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
        return [1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages];
    };

    return (
        <footer className="bg-slate-50 dark:bg-slate-800/50 px-6 py-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between flex-wrap gap-4">
            {/* Record count */}
            <p className="text-sm text-slate-500 dark:text-slate-400">
                Showing{' '}
                <span className="font-semibold text-slate-900 dark:text-white">{from}–{to}</span>
                {' '}of{' '}
                <span className="font-semibold text-slate-900 dark:text-white">{totalCount}</span>
                {' '}requests
            </p>

            {/* Page size selector */}
            <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                <label htmlFor="pageSize">Records per page:</label>
                <select
                    id="pageSize"
                    value={pageSize}
                    onChange={(e) => onPageSizeChange(Number(e.target.value))}
                    className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded px-2 py-1 text-slate-900 dark:text-slate-100"
                >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                </select>
            </div>

            {/* Page controls */}
            <div className="flex items-center gap-1">
                {/* Previous */}
                <button
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="inline-flex items-center px-3 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                    <span className="material-symbols-outlined text-lg">chevron_left</span>
                    Previous
                </button>

                {/* Page numbers */}
                {getPageNumbers().map((page, i) =>
                    page === '...' ? (
                        <span key={`ellipsis-${i}`} className="px-3 py-2 text-sm text-slate-400">…</span>
                    ) : (
                        <button
                            key={page}
                            onClick={() => onPageChange(page as number)}
                            className={`px-3 py-2 text-sm font-medium rounded-lg border transition-colors ${
                                page === currentPage
                                    ? 'bg-primary text-white border-primary'
                                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                            }`}
                        >
                            {page}
                        </button>
                    )
                )}

                {/* Next */}
                <button
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="inline-flex items-center px-3 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                    Next
                    <span className="material-symbols-outlined text-lg">chevron_right</span>
                </button>
            </div>
        </footer>
    );
}
