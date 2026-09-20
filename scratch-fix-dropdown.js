const fs = require('fs');

let code = fs.readFileSync('src/components/admin/tabs/ProductsTab.tsx', 'utf8');

// 1. Add searchViewLayout state near viewMode state
if (!code.includes('searchViewLayout')) {
  code = code.replace(
    'const [viewMode, setViewMode] = useState<"table" | "grid">("table");',
    'const [viewMode, setViewMode] = useState<"table" | "grid">("table");\n  const [searchViewLayout, setSearchViewLayout] = useState<"flat" | "grouped">("flat");'
  );
}

// 2. Fix the dropdown menu inside activeRowMenuId
const brokenDropdownSnippet = `<Trash2 className="w-3.5 h-3.5 text-red-500" />
                                                <span>Delete Product</span>
                                              </button>
                                            </div>
                                          )}`;

const fixedDropdownSnippet = `<button
                                                  type="button"
                                                  onClick={() => {
                                                    setActiveRowMenuId(null);
                                                    onEdit(product);
                                                  }}
                                                  className={\`w-full flex items-center gap-2 px-2.5 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer \${
                                                    isLight ? "hover:bg-slate-100" : "hover:bg-white/5"
                                                  }\`}
                                                >
                                                  <Edit className="w-3.5 h-3.5 text-blue-400" />
                                                  <span>Edit Product</span>
                                                </button>

                                                <button
                                                  type="button"
                                                  onClick={() => {
                                                    setActiveRowMenuId(null);
                                                    handleOpenReassign(product);
                                                  }}
                                                  className={\`w-full flex items-center gap-2 px-2.5 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer \${
                                                    isLight ? "hover:bg-slate-100" : "hover:bg-white/5"
                                                  }\`}
                                                >
                                                  <FolderTree className="w-3.5 h-3.5 text-purple-400" />
                                                  <span>Change Category</span>
                                                </button>

                                                <button
                                                  type="button"
                                                  onClick={() => {
                                                    setActiveRowMenuId(null);
                                                    setEditingStockId(product.id);
                                                    setTempStockValue(stockQty);
                                                  }}
                                                  className={\`w-full flex items-center gap-2 px-2.5 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer \${
                                                    isLight ? "hover:bg-slate-100" : "hover:bg-white/5"
                                                  }\`}
                                                >
                                                  <Package className="w-3.5 h-3.5 text-emerald-400" />
                                                  <span>Quick Stock Edit</span>
                                                </button>

                                                <div className={\`my-1 border-t \${isLight ? "border-slate-100" : "border-white/[0.06]"}\`} />

                                                <button
                                                  type="button"
                                                  onClick={() => {
                                                    setActiveRowMenuId(null);
                                                    onDelete(product.id);
                                                  }}
                                                  className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs font-semibold text-red-400 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer"
                                                  title="Delete Product"
                                                >
                                                  <Trash2 className="w-3.5 h-3.5 text-red-500" />
                                                  <span>Delete Product</span>
                                                </button>
                                              </div>
                                            )}`;

code = code.replace(brokenDropdownSnippet, fixedDropdownSnippet);

fs.writeFileSync('src/components/admin/tabs/ProductsTab.tsx', code, 'utf8');
console.log('ProductsTab.tsx dropdown updated successfully.');
