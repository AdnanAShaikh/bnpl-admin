import { useEffect } from "react";
import Sidebar from "../../components/Sidebar";
import DataTable from "../../components/DataTable";
import type { ColumnDef, RowAction } from "../../components/DataTable";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import {
  fetchAllPaymentPlans,
  deletePaymentPlan,
  selectPaymentPlan,
  selectPaymentPlanLoading,
  selectPaymentPlanError,
  type PaymentPlan,
} from "../../store/slices/adminSlice";
import { toast } from "react-toastify";
import { usePermission } from "../../hooks/usePermission";

// ─── Flatten for DataTable ────────────────────────────────────────────────────
const flattenPlan = (plan: PaymentPlan) => ({
  id:              plan.id,
  planName:        plan.planName,
  minimumAmount:   Number(plan.minimumAmount).toLocaleString("en-SA"),
  maximumAmount:   Number(plan.maximumAmount).toLocaleString("en-SA"),
  profitRate:      `${(Number(plan.profitRate) * 100).toFixed(2)}%`,
  termValue:       plan.termValue,
  termType:        plan.termType,
  termDescription: plan.termDescription ?? "—",
  currency:        plan.currency,
  status:          plan.status,
  lastModified:    new Date(plan.updatedAt).toLocaleDateString("en-SA"),
});

type FlatPlan = ReturnType<typeof flattenPlan>;

// ─── Columns ──────────────────────────────────────────────────────────────────
const COLUMNS: ColumnDef<FlatPlan>[] = [
  { key: "planName",        label: "Plan Name"        },
  { key: "minimumAmount",   label: "Min Amount"       },
  { key: "maximumAmount",   label: "Max Amount"       },
  { key: "profitRate",      label: "Profit Rate"      },
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
const PaymentPlanListingScreen = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const paymentPlans = useAppSelector(selectPaymentPlan);
  const loading      = useAppSelector(selectPaymentPlanLoading);
  const error        = useAppSelector(selectPaymentPlanError);
  
  
  const canCreate = usePermission("paymentPlan.create");
  const canView   = usePermission("paymentPlan.view");
  const canEdit   = usePermission("paymentPlan.edit");
  const canDelete = usePermission("paymentPlan.delete");

  useEffect(() => {
    dispatch(fetchAllPaymentPlans());
  }, [dispatch]);

  const handleDelete = async (plan: FlatPlan) => {
    if (!window.confirm(`Are you sure you want to delete "${plan.planName}"?`)) return;

    const result = await dispatch(deletePaymentPlan(plan.id));

    if (deletePaymentPlan.fulfilled.match(result)) {
      toast.success(`Payment plan "${plan.planName}" deleted successfully.`);
    } else {
      toast.error(result.payload as string);
    }
  };

  const ROW_ACTIONS: RowAction<FlatPlan>[] = [
    canView && {
      label: "View Plan",
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
      ),
      onClick: (plan: FlatPlan) => navigate(`/admin/payment-plan/view/${plan.id}`),
    },
    canEdit && {
      label: "Edit Plan",
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      ),
      onClick: (plan: FlatPlan) => navigate(`/admin/payment-plan/edit/${plan.id}`),
    },
    canDelete && {
      label: "Delete Plan",
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      ),
      onClick: handleDelete,
    },
  ]?.filter(Boolean) as RowAction<FlatPlan>[];

  const flatPlans = paymentPlans.map(flattenPlan);

  if (loading) return (
    <Sidebar>
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-400 text-sm">Loading payment plans...</p>
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
        <h1 className="text-xl font-bold text-[#1a2a4a]">Payment Plans</h1>
      </div>

      <DataTable<FlatPlan>
        title="All Payment Plans"
        columns={COLUMNS}
        dataSource={flatPlans}
        rowActions={ROW_ACTIONS}
        searchable
        searchKeys={["planName", "minimumAmount", "maximumAmount", "termType", "termValue"]}
        showStatusFilter
        statusOptions={["Active", "Inactive", "All Status"]}
        defaultStatus="All Status"
        defaultPageSize={10}
        actionButton={
          canCreate ? (
            <button
              onClick={() => navigate("/admin/payment-plan/new")}
              className="flex items-center gap-2 border-2 border-[#1a2a4a] text-[#1a2a4a] text-sm font-semibold px-4 py-2 rounded-full hover:bg-[#1a2a4a] hover:text-white transition-all duration-200"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              Create Plan
            </button>
          ) : null
        }
      />
    </Sidebar>
  );
};

export default PaymentPlanListingScreen;