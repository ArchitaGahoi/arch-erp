const ComboBoxPage = () => {
  const apiUrl = 'https://6853b5eba2a37a1d6f4988ca.mockapi.io/api/item/items';
  const [options, setOptions] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [query, setQuery] = useState('');

  useEffect(() => {
    axios.get(apiUrl)
      .then(res => setOptions(Array.isArray(res?.data) ? res.data[0] : []))
      .catch(() => setOptions([]));
  }, [apiUrl]);

  const filteredItems = query === ''
    ? options
    : options.filter(item =>
        item.itemName?.toLowerCase().includes(query.toLowerCase()) ||
        item.itemCode?.toLowerCase().includes(query.toLowerCase())
      );

  return (
    <div className="combo-box-container">
      <h2 style={{ textAlign: 'center' }}>ComboBox</h2>
      <label className="combo-box-label" htmlFor="combo-box-input">Item</label>
      <Combobox value={selectedItem} onChange={setSelectedItem} onClose={() => setQuery('')} >
        <ComboboxInput
          id="combo-box-input"
          aria-label="Item"
          className="combo-box-input"
          displayValue={(item) => item?.itemName || ''}
          onChange={(event) => setQuery(event.target.value)}
        />
        <ComboboxOptions anchor="bottom" className="combo-box-suggestions">
          {filteredItems.length === 0 && query !== '' ? (
            <div className="combo-box-suggestion">No results found.</div>
          ) : (
            filteredItems.map((item) => (
              <ComboboxOption key={item.id} value={item} className={({ active }) =>
                `combo-box-suggestion${active ? ' active' : ''}`
              }>
                <div>{item.itemName} ({item.itemCode})</div>
              </ComboboxOption>
            ))
          )}
        </ComboboxOptions>
      </Combobox>
    </div>
  );
};

export default ComboBoxPage;
