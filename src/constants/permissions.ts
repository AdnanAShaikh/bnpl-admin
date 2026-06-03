export const PERMISSION_GROUPS = [
  {
    group: "User",
    permissions: [
      { key: "user.create",          label: "Create User"      },
      { key: "user.view",            label: "View User"        },
      { key: "user.edit",            label: "Edit User"        },
      { key: "user.changePassword",  label: "Change Password"  },
    ],
  },
  {
    group: "Merchant",
    permissions: [
      { key: "merchant.create",      label: "Create Merchant"     },
      { key: "merchant.approve",     label: "Approve Merchant"    },
      { key: "merchant.reject",      label: "Reject Merchant"     },
      { key: "merchant.suspend",     label: "Suspend Merchant"    },
      { key: "merchant.view",        label: "View Merchant"  },
      { key: "merchant.edit",        label: "Edit Merchant"  },
    ],
  },
  {
    group: "Buyer",
    permissions: [
      { key: "buyer.create",         label: "Create Buyer"        },
      { key: "buyer.approve",        label: "Approve Buyer"       },
      { key: "buyer.reject",         label: "Reject Buyer"        },
      { key: "buyer.suspend",        label: "Suspend Buyer"       },
      { key: "buyer.view",           label: "View Buyer"     },
      { key: "buyer.edit",           label: "Edit Buyer"     },
    ],
  },
  {
    group: "Orders",
    permissions: [
      { key: "orders.view",          label: "View Orders"         },
      { key: "orders.approve",       label: "Approve Orders"      },
      { key: "orders.reject",        label: "Reject Orders"       },
      { key: "orders.fulfill",       label: "Fulfill Orders"      },
    ],
  },
  {
    group: "Products",
    permissions: [
      { key: "products.create",      label: "Create Product"      },
      { key: "products.view",        label: "View Products"       },
      { key: "products.edit",        label: "Edit Product"        },
      { key: "products.delete",      label: "Delete Product"      },
    ],
  },
  {
    group: "Payments",
    permissions: [
      { key: "payments.view",        label: "View Payments"       },
      { key: "payments.process",     label: "Process Payments"    },
      { key: "payments.refund",      label: "Refund Payments"     },
    ],
  },
  {
    group: "GNPL Configuration",
    permissions: [
      { key: "gnpl.view",            label: "View GNPL Config"    },
      { key: "gnpl.edit",            label: "Edit GNPL Config"    },
    ],
  },
  {
    group: "Roles",
    permissions: [
      { key: "roles.create",         label: "Create Role"         },
      { key: "roles.edit",           label: "Edit Role"           },
      { key: "roles.delete",         label: "Delete Role"         },
    ],
  },
  {
    group: "Notification Setup",
    permissions: [
      { key: "notifications.view",   label: "View Notifications"  },
      { key: "notifications.edit",   label: "Edit Notifications"  },
    ],
  },
];