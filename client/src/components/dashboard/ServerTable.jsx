export default function ServerTable({ servers, onRemove, showAddForm, newServerName, onNameChange, onAdd, onToggleForm }) {
  return (
    <div className="server-table">
      <div className="section-header">
        <h2>Server Performance</h2>
        <button className="btn-primary" onClick={onToggleForm}>
          {showAddForm ? 'Cancel' : '+ Add Server'}
        </button>
      </div>
      {showAddForm && (
        <div className="add-server-form">
          <input
            type="text"
            placeholder="Server name"
            value={newServerName}
            onChange={e => onNameChange(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && onAdd()}
            autoFocus
          />
          <button className="btn-primary" onClick={onAdd} disabled={!newServerName.trim()}>Add</button>
        </div>
      )}
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Sales (Month)</th>
            <th>Tips (Month)</th>
            <th>Orders</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {servers.map(server => (
            <tr key={server.id}>
              <td>{server.name}</td>
              <td>${server.sales.toLocaleString()}</td>
              <td>${server.tips.toLocaleString()}</td>
              <td>{server.orders}</td>
              <td><button className="remove-btn" onClick={() => onRemove(server.id)}>Remove</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
