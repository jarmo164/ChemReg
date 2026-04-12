type MenuItem = {
    label: string;
    icon?: string;
};

const menu: MenuItem[] = [
    { label: "Dashboard" },
    { label: "Chemical Register" },
    { label: "SDS Management" },
    { label: "Risk Assessments" },
    { label: "Compliance & Reporting" },
    { label: "Labeling" },
];

export default function Sidebar() {
    return (
        <aside className="sidebar">
            <h2>ChemReg</h2>

            <nav>
                {menu.map((item) => (
                    <div key={item.label} className="menu-item">
                        {item.label}
                    </div>
                ))}
            </nav>
        </aside>
    );
}