export const adminDataGridSx = {
  border: "1px solid var(--color-border)",
  backgroundColor: "var(--color-surface)",
  color: "var(--color-primary)",
  fontFamily: "inherit",
  fontSize: "0.875rem",
  lineHeight: 1.4,
  "& .MuiDataGrid-main": {
    overflow: "hidden",
  },
  "& .MuiDataGrid-columnHeaders": {
    minHeight: "52px !important",
    backgroundColor: "var(--color-surface-2)",
    borderBottom: "1px solid var(--color-border)",
    color: "var(--color-primary)",
    fontSize: "0.75rem",
    fontWeight: 800,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
  },
  "& .MuiDataGrid-columnHeader": {
    minHeight: "52px !important",
    outline: "none !important",
  },
  "& .MuiDataGrid-columnHeaderTitle": {
    color: "var(--color-primary)",
    fontWeight: 800,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  "& .MuiDataGrid-cell": {
    minHeight: "56px !important",
    borderBottom: "1px solid var(--color-border)",
    color: "var(--color-primary)",
    display: "flex",
    alignItems: "center",
    outline: "none !important",
  },
  "& .MuiDataGrid-row": {
    minHeight: "56px !important",
    backgroundColor: "var(--color-surface)",
  },
  "& .MuiDataGrid-row:hover": {
    backgroundColor: "var(--color-surface-2)",
  },
  "& .MuiDataGrid-footerContainer": {
    minHeight: "56px",
    borderTop: "1px solid var(--color-border)",
    backgroundColor: "var(--color-surface)",
    color: "var(--color-primary)",
  },
  "& .MuiTablePagination-root, & .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows": {
    color: "var(--color-primary)",
    fontSize: "0.875rem",
  },
  "& .MuiSvgIcon-root, & .MuiDataGrid-sortIcon, & .MuiDataGrid-menuIconButton": {
    color: "var(--color-primary)",
  },
  "& .MuiCheckbox-root": {
    color: "var(--color-secondary)",
  },
  "& .MuiCheckbox-root.Mui-checked": {
    color: "var(--color-accent)",
  },
  "& .MuiDataGrid-overlay": {
    backgroundColor: "var(--color-surface)",
    color: "var(--color-secondary)",
    fontSize: "0.95rem",
  },
  "& .MuiDataGrid-virtualScroller": {
    backgroundColor: "var(--color-surface)",
  },
};
