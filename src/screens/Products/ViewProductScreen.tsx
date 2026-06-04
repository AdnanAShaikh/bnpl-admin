import { useEffect } from "react";
import Sidebar from "../../components/Sidebar";
import { useNavigate, useParams } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import {
  fetchAllProducts,
  selectProducts,
} from "../../store/slices/adminSlice";
import { usePermission } from "../../hooks/usePermission";

// ─── Read-only Field (mirrors ViewMerchantScreen) ─────────────────────────────
const ReadField = ({ label, value }: { label: string; value?: string | null }) => (
  <div className="flex flex-col gap-1 w-full">
    <div className="border border-gray-100 rounded-xl px-4 pt-2.5 pb-2 bg-gray-50">
      <label className="text-xs text-gray-400 font-medium">{label}</label>
      <p className="text-sm text-gray-800 mt-0.5">{value || "—"}</p>
    </div>
  </div>
);

// ─── Status badge ─────────────────────────────────────────────────────────────
const STATUS_STYLES: Record<string, string> = {
  Active:   "bg-teal-600",
  Inactive: "bg-gray-500",
};

// ─── Screen ───────────────────────────────────────────────────────────────────
const ViewProductScreen = () => {
  const { id }    = useParams<{ id: string }>();
  const navigate  = useNavigate();
  const dispatch  = useAppDispatch();
  const products  = useAppSelector(selectProducts);
  const product   = products.find((p) => p.id === Number(id));
  const canEdit   = usePermission("products.edit");

  useEffect(() => {
    if (products.length === 0) dispatch(fetchAllProducts());
  }, [dispatch, products.length]);

  if (products.length > 0 && !product) {
    return (
      <Sidebar>
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-400 text-sm">Product not found.</p>
        </div>
      </Sidebar>
    );
  }

  return (
    <Sidebar>
      {/* ── Header ── */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/admin/product/all")}
            className="text-gray-400 hover:text-[#1a2a4a] transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <h1 className="text-xl font-bold text-[#1a2a4a]">View Product</h1>
            {product && (
              <p className="text-xs text-gray-400 mt-0.5">
                {product.productName} · #{product.id}
              </p>
            )}
          </div>
        </div>

        {product && (
          <span
            className={`inline-block text-xs font-bold px-3 py-1.5 rounded-lg text-white ${STATUS_STYLES[product.status] ?? "bg-gray-400"}`}
          >
            {product.status}
          </span>
        )}
      </div>

      <div className="flex flex-col gap-5">
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <p className="text-sm font-bold text-[#1a2a4a] mb-5">Product Details</p>

          <div className="flex flex-col gap-4">

            {/* Row 1 — Product Name + Status */}
            <div className="grid grid-cols-2 gap-4">
              <ReadField label="Product Name" value={product?.productName} />
              <ReadField label="Status"       value={product?.status}      />
            </div>

            {/* Row 2 — Term Value + Term Type + Currency */}
            <div className="grid grid-cols-3 gap-4">
              <ReadField label="Term Value" value={product ? String(product.termValue) : null} />
              <ReadField label="Term Type"  value={product?.termType}                          />
              <ReadField label="Currency"   value={product?.currency}                          />
            </div>

            {/* Row 3 — Min Amount + Max Amount */}
            <div className="grid grid-cols-2 gap-4">
              <ReadField
                label="Minimum Amount"
                value={product ? product.minimumAmount.toLocaleString("en-SA") : null}
              />
              <ReadField
                label="Maximum Amount"
                value={product ? product.maximumAmount.toLocaleString("en-SA") : null}
              />
            </div>

            {/* Row 4 — Term Description */}
            <ReadField label="Term Description"   value={product?.termDescription}   />

            {/* Row 5 — Arabic Description */}
            <ReadField label="Arabic Description" value={product?.arabicDescription} />

            {/* Row 6 — Additional Notes */}
            <ReadField label="Additional Notes"   value={product?.additionalNotes}   />

          </div>
        </div>

        {/* ── Footer ── */}
        <div className="flex items-center justify-between pb-2">
          <button
            onClick={() => navigate(-1)}
            className="px-8 py-2.5 border-2 border-gray-300 text-gray-600 font-semibold text-sm rounded-xl hover:border-[#1a2a4a] hover:text-[#1a2a4a] transition-all duration-200"
          >
            Back
          </button>

          {
            canEdit ? 
              <button
                onClick={() => navigate(`/admin/product/edit/${id}`)}
                className="px-10 py-2.5 bg-[#1a2a4a] hover:bg-[#243a64] active:scale-[0.98] text-white font-semibold text-sm rounded-xl transition-all duration-200 shadow-md"
              >
                Edit Product
              </button>
          : null
          }
     
        </div>
      </div>
    </Sidebar>
  );
};

export default ViewProductScreen;