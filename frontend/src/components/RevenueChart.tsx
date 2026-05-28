

const RevenueChart = () => {
  const data = [
    { month: 'Ene', value: 0 },
    { month: 'Feb', value: 0 },
    { month: 'Mar', value: 0 },
    { month: 'Abr', value: 0 },
    { month: 'May', value: 0 },
    { month: 'Jun', value: 0, active: true },
  ];

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-6 flex flex-col h-full">
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-lg font-bold text-neutral-900">Ingresos Mensuales</h3>
        <select className="bg-neutral-50 border border-neutral-200 text-neutral-700 text-sm rounded-lg focus:ring-orange-500 focus:border-orange-500 block p-2 outline-none">
          <option>2023</option>
          <option>2022</option>
        </select>
      </div>
      
      <div className="flex-1 flex items-end justify-between pt-4 min-h-[200px] gap-2">
        {data.map((item) => (
          <div key={item.month} className="flex flex-col items-center gap-3 flex-1 h-full justify-end group">
            <div className="w-full relative flex items-end justify-center h-full bg-neutral-50/50 rounded-t-lg overflow-hidden group-hover:bg-neutral-100 transition-colors">
              <div 
                className={`w-full rounded-t-lg transition-all duration-500 ${item.active ? 'bg-gradient-to-t from-orange-500 to-orange-400 shadow-md shadow-orange-200' : 'bg-neutral-200 group-hover:bg-neutral-300'}`} 
                style={{ height: `${Math.max(item.value, 4)}%` }}
              ></div>
            </div>
            <span className={`text-xs font-medium ${item.active ? 'text-orange-600' : 'text-neutral-500'}`}>{item.month}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RevenueChart;
