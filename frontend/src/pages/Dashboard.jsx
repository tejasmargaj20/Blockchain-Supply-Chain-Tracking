import { useEffect, useMemo, useState } from "react";

import {
    BarChart,
    Bar,
    LineChart,
    Line,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    LabelList,
} from "recharts";

const API_URL = "http://localhost:5000";

const COLORS = [
    "#0d6efd",
    "#20c997",
    "#ffc107",
    "#dc3545",
    "#6f42c1",
];

function Dashboard() {

    const [stats, setStats] = useState({
        totalProducts: 0,
        totalUsers: 0,
        totalTransfers: 0,
        totalInventory: 0,
        pendingTransfers: 0,
        failedTransfers: 0,
    });

    const [categoryData, setCategoryData] = useState([]);
    const [inventoryData, setInventoryData] = useState([]);
    const [transferStatusData, setTransferStatusData] = useState([]);
    const [productStatusData, setProductStatusData] = useState([]);
    const [transferTrendData, setTransferTrendData] = useState([]);
    const [manufacturerData, setManufacturerData] = useState([]);
    const [recentTransfers, setRecentTransfers] = useState([]);

    const [categoryFilter, setCategoryFilter] = useState("All");
    const [productStatusFilter, setProductStatusFilter] = useState("All");
    const [transferStatusFilter, setTransferStatusFilter] = useState("All");

    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState("");

    async function fetchData(endpoint) {

        const response = await fetch(`${API_URL}${endpoint}`);

        if (!response.ok) {
            throw new Error(`Failed to load ${endpoint}`);
        }

        return response.json();
    }

    
async function loadDashboardData(isRefresh = false) {

    console.log("FILTER VALUES:", {
        categoryFilter,
        productStatusFilter,
        transferStatusFilter
    });

    try {
   

        if (isRefresh) {
            setRefreshing(true);
        } else {
            setLoading(true);
        }

        setError("");


        /* =========================
           BUILD FILTER PARAMETERS
        ========================= */

        const params = new URLSearchParams();

        if (categoryFilter !== "All") {
            params.append(
                "category",
                categoryFilter
            );
        }

        if (productStatusFilter !== "All") {
            params.append(
                "productStatus",
                productStatusFilter
            );
        }

        if (transferStatusFilter !== "All") {
            params.append(
                "transferStatus",
                transferStatusFilter
            );
        }


        /* =========================
           FILTERED DASHBOARD DATA
        ========================= */

        const dashboardData =
            await fetchData(
                `/api/dashboard/filtered?${params.toString()}`
            );
console.log("FILTERED API RESPONSE:", dashboardData);

        /* =========================
           USER COUNT
           USERS ARE NOT FILTERED
        ========================= */

        const allStats =
            await fetchData(
                "/api/dashboard/stats"
            );


        /* =========================
           SET KPI DATA
        ========================= */

        setStats({

            totalProducts:
                Number(
                    dashboardData.stats.totalProducts
                ) || 0,

            totalUsers:
                Number(
                    allStats.totalUsers
                ) || 0,

            totalTransfers:
                Number(
                    dashboardData.stats.totalTransfers
                ) || 0,

            totalInventory:
                Number(
                    dashboardData.stats.totalInventory
                ) || 0,

            pendingTransfers:
                Number(
                    dashboardData.stats.pendingTransfers
                ) || 0,

            failedTransfers:
                Number(
                    dashboardData.stats.failedTransfers
                ) || 0

        });


        /* =========================
           SET CHART DATA
        ========================= */

        setCategoryData(
            dashboardData.categories || []
        );

        setInventoryData(
            dashboardData.inventoryByCategory || []
        );

        setTransferStatusData(
            dashboardData.transferStatuses || []
        );

        setProductStatusData(
            dashboardData.productStatuses || []
        );

        setTransferTrendData(
            dashboardData.transferTrend || []
        );

        setManufacturerData(
            dashboardData.manufacturers || []
        );


        /* =========================
           RECENT TRANSFERS
        ========================= */

        const recent =
            await fetchData(
                "/api/dashboard/recent-transfers"
            );

        setRecentTransfers(
            recent || []
        );


    } catch (err) {

        console.error(
            "Dashboard loading error:",
            err
        );

        setError(
            "Unable to load dashboard data. Please make sure the backend is running."
        );

    } finally {

        setLoading(false);
        setRefreshing(false);

    }

}

    useEffect(() => {

    loadDashboardData();

    const interval = setInterval(() => {

        loadDashboardData(true);

    }, 30000);


    return () => {

        clearInterval(interval);

    };

}, [
    categoryFilter,
    productStatusFilter,
    transferStatusFilter
]);

    /* =========================
       FILTER OPTIONS
    ========================= */

    const categories = [
    "All",
    "Food",
    "Medicine",
    "Electronic",
    "Clothes",
    "Other"
];


const productStatuses = [
    "All",
    "Manufactured",
    "Delivered",
    "In Transit"
];


const transferStatuses = [
    "All",
    "Completed",
    "Pending",
    "Failed"
];

    /* =========================
       FILTER RECENT TRANSFERS
    ========================= */

    const filteredTransfers = useMemo(() => {

        return recentTransfers.filter((transfer) => {

            const categoryMatch =
                categoryFilter === "All" ||
                transfer.category === categoryFilter;

            const productStatusMatch =
                productStatusFilter === "All" ||
                transfer.product_status === productStatusFilter;

            const transferStatusMatch =
                transferStatusFilter === "All" ||
                transfer.status === transferStatusFilter;

            return (
                categoryMatch &&
                productStatusMatch &&
                transferStatusMatch
            );

        });

    }, [
        recentTransfers,
        categoryFilter,
        productStatusFilter,
        transferStatusFilter,
    ]);


    /* =========================
       ANALYTICS
    ========================= */

    const totalTransfers = Number(stats.totalTransfers) || 0;
const failedTransfers = Number(stats.failedTransfers) || 0;
const pendingTransfers = Number(stats.pendingTransfers) || 0;

const successfulTransfers = Math.max(
    totalTransfers - failedTransfers - pendingTransfers,
    0
);

const successRate = totalTransfers > 0
    ? Math.round((successfulTransfers / totalTransfers) * 100)
    : 0;

const riskCount = pendingTransfers + failedTransfers;

const riskPercentage = totalTransfers > 0
    ? Math.round((riskCount / totalTransfers) * 100)
    : 0;

const riskLevel =
    riskPercentage >= 30
        ? "HIGH"
        : riskPercentage >= 15
            ? "MEDIUM"
            : "LOW";


    /* =========================
       INSIGHTS
    ========================= */

    const topCategory = useMemo(() => {

        if (!inventoryData.length) {
            return null;
        }

        return [...inventoryData].sort(
            (a, b) =>
                Number(b.total_inventory) -
                Number(a.total_inventory)
        )[0];

    }, [inventoryData]);


    const topManufacturer = useMemo(() => {

        if (!manufacturerData.length) {
            return null;
        }

        return [...manufacturerData].sort(
            (a, b) =>
                Number(b.inventory) -
                Number(a.inventory)
        )[0];

    }, [manufacturerData]);


    /* =========================
       LOADING
    ========================= */

    if (loading) {

        return (

            <div className="container py-5 text-center">

                <div
                    className="spinner-border text-primary mb-3"
                    role="status"
                ></div>

                <h4 className="fw-bold">
                    Loading Supply Chain Intelligence...
                </h4>

                <p className="text-muted">
                    Connecting to your live project database.
                </p>

            </div>
        );
    }


    /* =========================
       ERROR
    ========================= */

    if (error) {

        return (

            <div className="container py-5">

                <div className="alert alert-danger">

                    <i className="bi bi-exclamation-triangle-fill me-2"></i>

                    {error}

                </div>

                <button
                    className="btn btn-primary"
                    onClick={() =>
                        loadDashboardData()
                    }
                >
                    Try Again
                </button>

            </div>
        );
    }


    return (

        <div
            className="min-vh-100"
            style={{
                background:
                    "linear-gradient(135deg, #f8fbff 0%, #eef4ff 100%)",
            }}
        >

            <div className="container-fluid px-4 py-4">


                {/* =========================
                    HEADER
                ========================= */}

                <div
                    className="card border-0 shadow-sm mb-4"
                    style={{
                        borderRadius: "18px",
                        overflow: "hidden",
                    }}
                >

                    <div className="card-body p-4">

                        <div className="row align-items-center">

                            <div className="col-lg-8">

                                <div className="d-flex align-items-center">

                                    <div
                                        className="rounded-4 d-flex align-items-center justify-content-center me-3"
                                        style={{
                                            width: "60px",
                                            height: "60px",
                                            background:
                                                "linear-gradient(135deg, #0d6efd, #6f42c1)",
                                            color: "white",
                                        }}
                                    >
                                        <i className="bi bi-graph-up-arrow fs-3"></i>
                                    </div>

                                    <div>

                                        <h2 className="fw-bold mb-1">
                                            Supply Chain Intelligence
                                        </h2>

                                        <p className="text-muted mb-0">
                                            Real-time analytics,
                                            monitoring & insights
                                        </p>

                                    </div>

                                </div>

                            </div>

                            <div className="col-lg-4 text-lg-end mt-3 mt-lg-0">

                                <span
                                    className="badge rounded-pill bg-success-subtle text-success px-3 py-2 me-2"
                                >
                                    <i className="bi bi-circle-fill me-1"></i>
                                    System Live
                                </span>

                                <button
                                    className="btn btn-primary rounded-pill px-4"
                                    onClick={() =>
                                        loadDashboardData(true)
                                    }
                                    disabled={refreshing}
                                >

                                    <i className="bi bi-arrow-clockwise me-1"></i>

                                    {refreshing
                                        ? "Refreshing..."
                                        : "Refresh"}

                                </button>

                            </div>

                        </div>

                    </div>

                </div>


                {/* =========================
                    KPI CARDS
                ========================= */}

                <div className="row g-3 mb-4">

                    <KpiCard
                        title="Total Products"
                        value={Number(
                            stats.totalProducts
                        ).toLocaleString()}
                        icon="bi-box-seam"
                        gradient="linear-gradient(135deg,#0d6efd,#4dabf7)"
                    />

                    <KpiCard
                        title="Inventory Units"
                        value={Number(
                            stats.totalInventory
                        ).toLocaleString()}
                        icon="bi-stack"
                        gradient="linear-gradient(135deg,#198754,#20c997)"
                    />

                    <KpiCard
                        title="Total Transfers"
                        value={Number(
                            stats.totalTransfers
                        ).toLocaleString()}
                        icon="bi-arrow-left-right"
                        gradient="linear-gradient(135deg,#6f42c1,#9b6de3)"
                    />

                    <KpiCard
                        title="Total Users"
                        value={Number(
                            stats.totalUsers
                        ).toLocaleString()}
                        icon="bi-people"
                        gradient="linear-gradient(135deg,#0dcaf0,#3dd5f3)"
                    />

                    <KpiCard
                        title="Pending"
                        value={pendingTransfers}
                        icon="bi-hourglass-split"
                        gradient="linear-gradient(135deg,#fd7e14,#ffc107)"
                    />

                    <KpiCard
                        title="Failed"
                        value={failedTransfers}
                        icon="bi-exclamation-triangle"
                        gradient="linear-gradient(135deg,#dc3545,#ff6b6b)"
                    />

                </div>


                {/* =========================
                    FILTERS
                ========================= */}

                <div
                    className="card border-0 shadow-sm mb-4"
                    style={{
                        borderRadius: "16px",
                    }}
                >

                    <div className="card-body p-4">

                        <div className="d-flex align-items-center mb-3">

                            <div className="bg-primary-subtle text-primary rounded-3 p-2 me-2">

                                <i className="bi bi-sliders"></i>

                            </div>

                            <div>

                                <h5 className="fw-bold mb-0">
                                    Dashboard Filters
                                </h5>

                                <small className="text-muted">
                                    Explore recent supply-chain activity
                                </small>

                            </div>

                        </div>


                        <div className="row g-3">

                            <FilterSelect
                                label="Category"
                                icon="bi-tags"
                                value={categoryFilter}
                                onChange={setCategoryFilter}
                                options={categories}
                            />

                            <FilterSelect
                                label="Product Status"
                                icon="bi-box"
                                value={productStatusFilter}
                                onChange={setProductStatusFilter}
                                options={productStatuses}
                            />

                            <FilterSelect
                                label="Transfer Status"
                                icon="bi-arrow-left-right"
                                value={transferStatusFilter}
                                onChange={setTransferStatusFilter}
                                options={transferStatuses}
                            />

                            <div className="col-md-3 d-flex align-items-end">

                                <button
                                    className="btn btn-outline-secondary w-100"
                                    onClick={() => {

                                        setCategoryFilter("All");
                                        setProductStatusFilter("All");
                                        setTransferStatusFilter("All");

                                    }}
                                >

                                    <i className="bi bi-x-circle me-1"></i>

                                    Clear Filters

                                </button>

                            </div>

                        </div>

                    </div>

                </div>


                {/* =========================
                    HEALTH + RISK
                ========================= */}

                <div className="row g-4 mb-4">


                    <div className="col-lg-8">

                        <div
                            className="card border-0 shadow-sm h-100"
                            style={{
                                borderRadius: "16px",
                            }}
                        >

                            <div className="card-body p-4">

                                <div className="d-flex justify-content-between align-items-center mb-3">

                                    <div>

                                        <h5 className="fw-bold mb-1">
                                            Supply Chain Health
                                        </h5>

                                        <small className="text-muted">
                                            Overall transfer performance
                                        </small>

                                    </div>

                                    <span
                                        className={`badge rounded-pill px-3 py-2 ${
                                            successRate >= 90
                                                ? "bg-success"
                                                : successRate >= 70
                                                ? "bg-warning text-dark"
                                                : "bg-danger"
                                        }`}
                                    >
                                        {successRate}% Success Rate
                                    </span>

                                </div>


                                <div
                                    className="progress mb-4"
                                    style={{
                                        height: "14px",
                                        borderRadius: "20px",
                                    }}
                                >

                                    <div
                                        className={`progress-bar ${
                                            successRate >= 90
                                                ? "bg-success"
                                                : successRate >= 70
                                                ? "bg-warning"
                                                : "bg-danger"
                                        }`}
                                        style={{
                                            width: `${successRate}%`,
                                        }}
                                    ></div>

                                </div>


                                <div className="row text-center">

                                    <HealthMetric
                                        value={successfulTransfers}
                                        label="Successful"
                                        icon="bi-check-circle-fill"
                                        color="text-success"
                                    />

                                    <HealthMetric
                                        value={pendingTransfers}
                                        label="Pending"
                                        icon="bi-hourglass-split"
                                        color="text-warning"
                                    />

                                    <HealthMetric
                                        value={failedTransfers}
                                        label="Failed"
                                        icon="bi-x-circle-fill"
                                        color="text-danger"
                                    />

                                </div>

                            </div>

                        </div>

                    </div>


                                       <div className="col-lg-4">

                        <div
                            className="card border-0 shadow-sm h-100"
                            style={{
                                borderRadius: "16px",
                            }}
                        >

                            <div className="card-body p-3">

                                {/* HEADER */}
                                <div className="d-flex justify-content-between align-items-center mb-2">

                                    <div>
                                        <h6 className="fw-bold mb-1">
                                            Risk Monitor
                                        </h6>

                                        <small className="text-muted">
                                            System safety status
                                        </small>
                                    </div>

                                    <span
                                        className={`badge rounded-pill px-3 py-2 ${
                                            riskLevel === "HIGH"
                                                ? "bg-danger"
                                                : riskLevel === "MEDIUM"
                                                    ? "bg-warning text-dark"
                                                    : "bg-success"
                                        }`}
                                    >
                                        {riskLevel === "LOW"
                                            ? "SAFE"
                                            : `${riskLevel} RISK`}
                                    </span>

                                </div>


                                {/* SAFETY STATUS */}
                                <div
                                    className={`text-center rounded-3 p-3 mb-3 ${
                                        riskLevel === "LOW"
                                            ? "bg-success-subtle"
                                            : riskLevel === "MEDIUM"
                                                ? "bg-warning-subtle"
                                                : "bg-danger-subtle"
                                    }`}
                                >

                                    <i
                                        className={`bi ${
                                            riskLevel === "LOW"
                                                ? "bi-shield-check text-success"
                                                : riskLevel === "MEDIUM"
                                                    ? "bi-shield-exclamation text-warning"
                                                    : "bi-shield-x text-danger"
                                        }`}
                                        style={{ fontSize: "28px" }}
                                    ></i>

                                    <h6 className="fw-bold mt-2 mb-1">

                                        {riskLevel === "LOW"
                                            ? "System is Safe"
                                            : riskLevel === "MEDIUM"
                                                ? "Needs Attention"
                                                : "Review Required"}

                                    </h6>

                                    <small className="text-muted">

                                        {riskLevel === "LOW"
                                            ? "Transactions are operating normally."
                                            : riskLevel === "MEDIUM"
                                                ? "Some transactions need review."
                                                : "Some transactions require attention."}

                                    </small>

                                </div>


                                {/* PENDING + FAILED */}
                                <div className="row g-2">

                                    <div className="col-6">

                                        <div className="border rounded-3 p-2 text-center">

                                            <small className="text-muted d-block">
                                                Pending
                                            </small>

                                            <strong className="fs-5">
                                                {pendingTransfers}
                                            </strong>

                                        </div>

                                    </div>


                                    <div className="col-6">

                                        <div className="border rounded-3 p-2 text-center">

                                            <small className="text-muted d-block">
                                                Failed
                                            </small>

                                            <strong className="fs-5">
                                                {failedTransfers}
                                            </strong>

                                        </div>

                                    </div>

                                </div>


                                {/* RISK LEVEL */}
                                <div className="mt-3">

                                    <div className="d-flex justify-content-between mb-1">

                                        <small className="text-muted">
                                            Risk level
                                        </small>

                                        <small className="fw-semibold">
                                            {riskPercentage}%
                                        </small>

                                    </div>

                                    <div
                                        className="progress"
                                        style={{
                                            height: "7px",
                                            borderRadius: "10px",
                                        }}
                                    >

                                        <div
                                            className={`progress-bar ${
                                                riskLevel === "HIGH"
                                                    ? "bg-danger"
                                                    : riskLevel === "MEDIUM"
                                                        ? "bg-warning"
                                                        : "bg-success"
                                            }`}
                                            style={{
                                                width: `${riskPercentage}%`,
                                            }}
                                        ></div>

                                    </div>

                                </div>

                            </div>

                        </div>

                    </div>


                {/* =========================
                    INVENTORY + TRANSFER STATUS
                ========================= */}

                <div className="row g-4 mb-4">


                    <ChartCard
                        title="Inventory by Category"
                        subtitle="Total units currently recorded in inventory"
                        icon="bi-boxes"
                    >

                        <ResponsiveContainer
                            width="100%"
                            height={330}
                        >

                            <BarChart
                                data={inventoryData}
                                layout="vertical"
                                margin={{
                                    left: 20,
                                    right: 20,
                                    top: 10,
                                    bottom: 10,
                                }}
                            >

                                <CartesianGrid
                                    strokeDasharray="3 3"
                                    horizontal={false}
                                />

                                <XAxis type="number" />

                                <YAxis
                                    type="category"
                                    dataKey="category"
                                    width={90}
                                />

                                <Tooltip />

                                <Bar
                                    dataKey="total_inventory"
                                    name="Inventory"
                                    fill="#0d6efd"
                                    radius={[
                                        0,
                                        8,
                                        8,
                                        0,
                                    ]}
                                />

                            </BarChart>

                        </ResponsiveContainer>

                    </ChartCard>


                    <ChartCard
                        title="Transfer Status"
                        subtitle="Operational transaction health"
                        icon="bi-pie-chart"
                    >

                        <ResponsiveContainer
                            width="100%"
                            height={330}
                        >

                            <PieChart>

                                <Pie
                                    data={transferStatusData}
                                    dataKey="total"
                                    nameKey="status"
                                    cx="50%"
                                    cy="48%"
                                    innerRadius={65}
                                    outerRadius={105}
                                    paddingAngle={4}
                                    label
                                >

                                    {transferStatusData.map(
                                        (entry, index) => (

                                            <Cell
                                                key={entry.status}
                                                fill={
                                                    COLORS[
                                                        index %
                                                            COLORS.length
                                                    ]
                                                }
                                            />

                                        )
                                    )}

                                </Pie>

                                <Tooltip />

                                <Legend />

                            </PieChart>

                        </ResponsiveContainer>

                    </ChartCard>

                </div>


                {/* =========================
                    PRODUCT LIFECYCLE + TREND
                ========================= */}

                <div className="row g-4 mb-4">


                    <ChartCard
                        title="Product Lifecycle"
                        subtitle="Current distribution of product states"
                        icon="bi-box-seam"
                    >

                        <ResponsiveContainer
                            width="100%"
                            height={330}
                        >

                            <BarChart
                                data={productStatusData}
                                layout="vertical"
                                margin={{
                                    left: 20,
                                    right: 20,
                                }}
                            >

                                <CartesianGrid
                                    strokeDasharray="3 3"
                                    horizontal={false}
                                />

                                <XAxis type="number" />

                                <YAxis
                                    type="category"
                                    dataKey="status"
                                    width={100}
                                />

                                <Tooltip />

                                <Bar
                                    dataKey="total"
                                    name="Products"
                                    fill="#20c997"
                                    radius={[
                                        0,
                                        8,
                                        8,
                                        0,
                                    ]}
                                />

                            </BarChart>

                        </ResponsiveContainer>

                    </ChartCard>


                    <ChartCard
                        title="Transfer Activity Trend"
                        subtitle="Daily supply-chain movement"
                        icon="bi-activity"
                    >

                        <ResponsiveContainer
                            width="100%"
                            height={330}
                        >

                           
<LineChart
    data={transferTrendData}
    margin={{
        top: 30,
        right: 25,
        left: 15,
        bottom: 10,
    }}
>
    <CartesianGrid
        strokeDasharray="3 3"
        vertical={false}
        stroke="#E5E7EB"
    />

    <XAxis
        dataKey="transfer_date"
        tickFormatter={(date) =>
            new Date(date).toLocaleDateString("en-IN", {
                day: "2-digit",
                month: "short",
            })
        }
        tick={{ fontSize: 12, fill: "#6B7280" }}
        tickMargin={10}
        axisLine={{ stroke: "#D1D5DB" }}
        tickLine={false}
    />


<YAxis
    allowDecimals={false}
    domain={[0, "auto"]}
    tick={{ fontSize: 12, fill: "#6B7280" }}
    tickLine={false}
    axisLine={false}
    tickMargin={8}
    width={60}
    label={{
        value: "Number of Transfers",
        angle: -90,
        position: "insideLeft",
        offset: 5,
        style: {
            fill: "#6B7280",
            fontSize: 12,
        },
    }}
/>


    <Tooltip
        contentStyle={{
            backgroundColor: "#FFFFFF",
            border: "1px solid #E5E7EB",
            borderRadius: "10px",
            padding: "10px 14px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
        }}
        labelStyle={{
            color: "#111827",
            fontWeight: 600,
            marginBottom: "4px",
        }}
        formatter={(value) => [
            `${value} transfers`,
            "Daily Transfer Count",
        ]}
        labelFormatter={(date) =>
            `Date: ${new Date(date).toLocaleDateString("en-IN", {
                day: "2-digit",
                month: "short",
                year: "numeric",
            })}`
        }
    />

    

<Line
    type="basis"
    dataKey="total_transfers"
    name="Daily Transfers"
    stroke="#0D6EFD"
    strokeWidth={3}
    dot={false}
    activeDot={{
        r: 6,
        fill: "#0D6EFD",
    }}
/>


</LineChart>
</ResponsiveContainer>
</ChartCard>

</div>


                {/* =========================
                    MANUFACTURER PERFORMANCE
                ========================= */}

                <div
                    className="card border-0 shadow-sm mb-4"
                    style={{
                        borderRadius: "16px",
                    }}
                >

                    <div className="card-body p-4">

                        <div className="d-flex align-items-center mb-3">

                            <div className="bg-success-subtle text-success rounded-3 p-2 me-2">

                                <i className="bi bi-building"></i>

                            </div>

                            <div>

                                <h5 className="fw-bold mb-0">
                                    Manufacturer Performance
                                </h5>

                                <small className="text-muted">
                                    Product contribution and inventory
                                </small>

                            </div>

                        </div>


                        <ResponsiveContainer
                            width="100%"
                            height={380}
                        >

                            <BarChart
                                data={manufacturerData}
                                layout="vertical"
                                margin={{
                                    left: 30,
                                    right: 30,
                                    top: 10,
                                    bottom: 10,
                                }}
                            >

                                <CartesianGrid
                                    strokeDasharray="3 3"
                                    horizontal={false}
                                />

                                <XAxis type="number" />

                                <YAxis
                                    type="category"
                                    dataKey="manufacturer"
                                    width={130}
                                />

                                <Tooltip />

                                <Legend />

                                <Bar
                                    dataKey="inventory"
                                    name="Inventory"
                                    fill="#198754"
                                    radius={[
                                        0,
                                        8,
                                        8,
                                        0,
                                    ]}
                                />

                            </BarChart>

                        </ResponsiveContainer>

                    </div>

                </div>


                {/* =========================
                    SUPPLY CHAIN INSIGHTS
                ========================= */}

                <div
                    className="card border-0 shadow-sm mb-4"
                    style={{
                        borderRadius: "16px",
                    }}
                >

                    <div className="card-body p-4">

                        <div className="d-flex align-items-center mb-4">

                            <div
                                className="rounded-3 p-3 me-3 text-white"
                                style={{
                                    background:
                                        "linear-gradient(135deg,#6f42c1,#9b6de3)",
                                }}
                            >

                                <i className="bi bi-lightbulb-fill fs-4"></i>

                            </div>

                            <div>

                                <h5 className="fw-bold mb-1">
                                    Supply Chain Insights
                                </h5>

                                <small className="text-muted">
                                    Automatically generated from live database data
                                </small>

                            </div>

                        </div>


                        <div className="row g-3">


                            <InsightCard
                                icon="bi-boxes"
                                title="Inventory Leader"
                                text={
                                    topCategory
                                        ? `${topCategory.category} currently has the highest inventory with ${Number(
                                              topCategory.total_inventory
                                          ).toLocaleString()} units.`
                                        : "Inventory information unavailable."
                                }
                                color="primary"
                            />


                            <InsightCard
                                icon="bi-check-circle"
                                title="Transfer Performance"
                                text={`${successRate}% of recorded transfers are currently successful based on the available transaction data.`}
                                color="success"
                            />


                            <InsightCard
                                icon="bi-shield-exclamation"
                                title="Risk Exposure"
                                text={`${riskCount} transactions currently require attention because they are pending or failed.`}
                                color="danger"
                            />


                            <InsightCard
                                icon="bi-building"
                                title="Top Manufacturer"
                                text={
                                    topManufacturer
                                        ? `${topManufacturer.manufacturer} currently has the highest recorded inventory contribution.`
                                        : "Manufacturer information unavailable."
                                }
                                color="warning"
                            />

                        </div>

                    </div>

                </div>


                {/* =========================
                    RECENT TRANSFERS
                ========================= */}

                <div
                    className="card border-0 shadow-sm mb-5"
                    style={{
                        borderRadius: "16px",
                    }}
                >

                    <div className="card-body p-4">

                        <div className="d-flex justify-content-between align-items-center mb-3">

                            <div>

                                <h5 className="fw-bold mb-1">
                                    Recent Transfer Activity
                                </h5>

                                <small className="text-muted">
                                    Latest supply-chain movements
                                </small>

                            </div>

                            <span className="badge bg-primary-subtle text-primary rounded-pill px-3 py-2">

                                <i className="bi bi-database-check me-1"></i>

                                {filteredTransfers.length} Records

                            </span>

                        </div>


                        <div className="table-responsive">

                            <table className="table table-hover align-middle">

                                <thead className="table-light">

                                    <tr>

                                        <th>Product</th>
                                        <th>Category</th>
                                        <th>From</th>
                                        <th>To</th>
                                        <th>Qty</th>
                                        <th>Product Status</th>
                                        <th>Transfer</th>
                                        <th>Date</th>

                                    </tr>

                                </thead>


                                <tbody>

                                    {filteredTransfers.length === 0 ? (

                                        <tr>

                                            <td
                                                colSpan="8"
                                                className="text-center text-muted py-5"
                                            >

                                                <i className="bi bi-search fs-3 d-block mb-2"></i>

                                                No transfers match the selected filters.

                                            </td>

                                        </tr>

                                    ) : (

                                        filteredTransfers.map(
                                            (transfer) => (

                                                <tr
                                                    key={transfer.id}
                                                >

                                                    <td>

                                                        <div>

                                                            <strong>
                                                                {
                                                                    transfer.product_id
                                                                }
                                                            </strong>

                                                            <div className="small text-muted">
                                                                {
                                                                    transfer.product_name
                                                                }
                                                            </div>

                                                        </div>

                                                    </td>


                                                    <td>

                                                        <span className="badge bg-primary-subtle text-primary">

                                                            {
                                                                transfer.category
                                                            }

                                                        </span>

                                                    </td>


                                                    <td>
                                                        {
                                                            transfer.from_user
                                                        }
                                                    </td>


                                                    <td>
                                                        {
                                                            transfer.to_user
                                                        }
                                                    </td>


                                                    <td>

                                                        <strong>
                                                            {
                                                                transfer.quantity
                                                            }
                                                        </strong>

                                                    </td>


                                                    <td>

                                                        <StatusBadge
                                                            status={
                                                                transfer.product_status
                                                            }
                                                        />

                                                    </td>


                                                    <td>

                                                        <StatusBadge
                                                            status={
                                                                transfer.status
                                                            }
                                                        />

                                                    </td>


                                                    <td>

                                                        {new Date(
                                                            transfer.transferred_at
                                                        ).toLocaleDateString()}

                                                    </td>

                                                </tr>

                                            )
                                        )

                                    )}

                                </tbody>

                            </table>

                        </div>

                    </div>

                </div>


                <div className="text-center text-muted pb-4">

                    <small>

                        Blockchain Supply Chain Tracking System
                        {" • "}
                        Analytics Dashboard
                        {" • "}
                        Auto-refresh every 30 seconds

                    </small>

                </div>

            </div>

        </div>
    );


        </div>
    );
}
/* =====================================================
   KPI CARD
===================================================== */

        
function KpiCard({
    title,
    value,
    icon,
    gradient,
}) {

    return (

        <div className="col-6 col-md-4 col-xl-2">

            <div
                className="card border-0 shadow-sm h-100"
                style={{
                    borderRadius: "16px",
                    overflow: "hidden",
                }}
            >

                <div
                    style={{
                        height: "4px",
                        background: gradient,
                    }}
                ></div>

                <div className="card-body p-3">

                    <div className="d-flex justify-content-between align-items-start">

                        <div>

                            <small className="text-muted">
                                {title}
                            </small>

                            <h3 className="fw-bold mt-2 mb-0">
                                {value}
                            </h3>

                        </div>


                        <div
                            className="rounded-3 d-flex align-items-center justify-content-center"
                            style={{
                                width: "42px",
                                height: "42px",
                                background: gradient,
                                color: "white",
                            }}
                        >

                            <i
                                className={`bi ${icon}`}
                            ></i>

                        </div>

                    </div>

                </div>

            </div>

        </div>
    );
}


/* =====================================================
   FILTER SELECT
===================================================== */

function FilterSelect({
    label,
    icon,
    value,
    onChange,
    options,
}) {

    return (

        <div className="col-md-3">

            <label className="form-label fw-semibold">

                <i className={`bi ${icon} me-1`}></i>

                {label}

            </label>

            <select
                className="form-select"
                value={value}
                onChange={(e) =>
                    onChange(e.target.value)
                }
            >

                {options.map((option) => (

                    <option
                        key={option}
                        value={option}
                    >
                        {option}
                    </option>

                ))}

            </select>

        </div>
    );
}


/* =====================================================
   CHART CARD
===================================================== */

function ChartCard({
    title,
    subtitle,
    icon,
    children,
}) {

    return (

        <div className="col-lg-6">

            <div
                className="card border-0 shadow-sm h-100"
                style={{
                    borderRadius: "16px",
                }}
            >

                <div className="card-body p-4">

                    <div className="d-flex align-items-center mb-1">

                        <div className="bg-primary-subtle text-primary rounded-3 p-2 me-2">

                            <i className={`bi ${icon}`}></i>

                        </div>

                        <h5 className="fw-bold mb-0">
                            {title}
                        </h5>

                    </div>

                    <small className="text-muted">
                        {subtitle}
                    </small>

                    <div className="mt-3">
                        {children}
                    </div>

                </div>

            </div>

        </div>
    );
}


/* =====================================================
   HEALTH METRIC
===================================================== */

function HealthMetric({
    value,
    label,
    icon,
    color,
}) {

    return (

        <div className="col-4">

            <i
                className={`bi ${icon} ${color} fs-4`}
            ></i>

            <h4
                className={`fw-bold mb-0 ${color}`}
            >
                {value}
            </h4>

            <small className="text-muted">
                {label}
            </small>

        </div>
    );
}


/* =====================================================
   INSIGHT CARD
===================================================== */

function InsightCard({
    icon,
    title,
    text,
    color,
}) {

    return (

        <div className="col-md-6">

            <div
                className={`border rounded-4 p-3 h-100 bg-${color}-subtle`}
            >

                <div className="d-flex">

                    <div
                        className={`text-${color} me-3`}
                    >

                        <i
                            className={`bi ${icon} fs-3`}
                        ></i>

                    </div>

                    <div>

                        <h6 className="fw-bold mb-1">
                            {title}
                        </h6>

                        <p className="small text-muted mb-0">
                            {text}
                        </p>

                    </div>

                </div>

            </div>

        </div>
    );
}


/* =====================================================
   STATUS BADGE
===================================================== */

function StatusBadge({
    status,
}) {

    let className = "bg-secondary";

    if (status === "Completed") {
        className = "bg-success";
    }

    if (status === "Pending") {
        className = "bg-warning text-dark";
    }

    if (status === "Failed") {
        className = "bg-danger";
    }

    if (status === "Delivered") {
        className = "bg-success";
    }

    if (status === "In Transit") {
        className = "bg-primary";
    }

    if (status === "Manufactured") {
        className = "bg-secondary";
    }

    return (

        <span
            className={`badge ${className}`}
        >
            {status}
        </span>
    );
}


export default Dashboard;