import React, { useEffect } from "react";
import Sidebar from "../../components/Sidebar";
import DataTable from "../../components/DataTable";
import type { ColumnDef, RowAction } from "../../components/DataTable";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import {
  fetchAllProducts,
  deleteProduct,
  selectProducts,
  selectProductsLoading,
  selectProductsError,
  type Product,
} from "../../store/slices/adminSlice";
import { toast } from "react-toastify";
import { usePermission } from "../../hooks/usePermission";

// ─── Flatten for DataTable ────────────────────────────────────────────────────
const flattenProduct = (product: Product) => ({
  id:              product.id,
  productName:     product.productName,
  minimumAmount:   product.minimumAmount.toLocaleString("en-SA"),
  maximumAmount:   product.maximumAmount.toLocaleString("en-SA"),
  termValue:       product.termValue,
  termType:        product.termType,
  termDescription: product.termDescription ?? "—",
  currency:        product.currency,
  status:          product.status,
  lastModified:    new Date(product.updatedAt).toLocaleDateString("en-SA"),
});

type FlatProduct = ReturnType<typeof flattenProduct>;

// ─── Columns ──────────────────────────────────────────────────────────────────
const COLUMNS: ColumnDef<FlatProduct>[] = [
  { key: "productName",     label: "Product Name"     },
  { key: "minimumAmount",   label: "Min Amount"       },
  { key: "maximumAmount",   label: "Max Amount"       },
  { key: "termValue",       label: "Term Value"       },
  { key: "termType",        label: "Term Type"        },
  { key: "currency",        label: "Currency"         },
  { key: "lastModified",    label: "Last Modified"    },
  {
    key: "status",
    label: "Status",
    render: (value) => (
      <span className={`inline-block text-xs font-bold px-3 py-1 rounded-md text-white ${
        value === "Active" ? "bg-green-500" : "bg-gray-400"
      }`}>
        {String(value)}
      </span>
    ),
  },
];

// ─── Screen ───────────────────────────────────────────────────────────────────
const ProductsListingScreen = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const products = useAppSelector(selectProducts);
  const loading  = useAppSelector(selectProductsLoading);
  const error    = useAppSelector(selectProductsError);

  const canCreate = usePermission("products.create");
  const canView = usePermission("products.view");
  const canEdit   = usePermission("products.edit");
  const canDelete = usePermission("products.delete");

  useEffect(() => {
    dispatch(fetchAllProducts());
  }, [dispatch]);

  const handleDelete = async (product: FlatProduct) => {
    if (!window.confirm(`Are you sure you want to delete "${product.productName}"?`)) return;

    const result = await dispatch(deleteProduct(product.id));

    if (deleteProduct.fulfilled.match(result)) {
      toast.success(`Product "${product.productName}" deleted successfully.`);
    } else {
      toast.error(result.payload as string);
    }
  };

  const ROW_ACTIONS: RowAction<FlatProduct>[] = [
    canView && {
      label: "View Product",
      icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
      </svg>
      ),
      onClick: (product: FlatProduct) => navigate(`/admin/product/view/${product.id}`),
    },
    canEdit && {
      label: "Edit Product",
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      ),
      onClick: (product: FlatProduct) => navigate(`/admin/product/edit/${product.id}`),
    },
    canDelete && {
      label: "Delete Product",
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      ),
      onClick: handleDelete,
    },
  ].filter(Boolean) as RowAction<FlatProduct>[];

  const flatProducts = products.map(flattenProduct);

  if (loading) return (
    <Sidebar>
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-400 text-sm">Loading products...</p>
      </div>
    </Sidebar>
  );

  if (error) return (
    <Sidebar>
      <div className="flex items-center justify-center h-64">
        <p className="text-red-500 text-sm">{error}</p>
      </div>
    </Sidebar>
  );

  return (
    <Sidebar>
      <div className="mb-5">
        <h1 className="text-xl font-bold text-[#1a2a4a]">Products</h1>
      </div>

      <DataTable<FlatProduct>
        title="All Products"
        columns={COLUMNS}
        dataSource={flatProducts}
        rowActions={ROW_ACTIONS}
        searchable
        searchKeys={["productName", "minimumAmount", "maximumAmount", "termType", "termValue"]}
        showStatusFilter
        statusOptions={["Active", "Inactive", "All Status"]}
        defaultStatus="All Status"
        defaultPageSize={10}
        actionButton={
        canCreate ? (

          <button
            onClick={() => navigate("/admin/product/new")}
            className="flex items-center gap-2 border-2 border-[#1a2a4a] text-[#1a2a4a] text-sm font-semibold px-4 py-2 rounded-full hover:bg-[#1a2a4a] hover:text-white transition-all duration-200"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Create Product
          </button>
        ): null
        }
      />
    </Sidebar>
  );
};

export default ProductsListingScreen;