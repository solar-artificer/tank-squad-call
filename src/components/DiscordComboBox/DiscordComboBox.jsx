import {Combobox} from "@headlessui/react";

const {useState, useMemo} = BdApi.React;

function getInitials(text) {
    if (!text) return '';
    const words = text.trim().split(/\s+/);
    if (words.length === 1) {
        return words[0].substring(0, 2).toUpperCase();
    }
    return (words[0][0] + words[1][0]).toUpperCase();
}

export default function DiscordComboBox({
                                            items,
                                            value,
                                            onChange,
                                            placeholder,
                                            displayKey = 'name',
                                            showImage = false,
                                            imageKey = 'image',
                                            emptyMessage = 'No items found.',
                                            showFallbackInitials = false,
                                        }) {
    const [query, setQuery] = useState('');

    const selectedItem = useMemo(() => {
        return items.find(item => item.id === value) ?? null;
    }, [items, value]);

    const filteredItems = useMemo(() => {
        if (query === '') {
            return items;
        }
        return items.filter((item) => {
            return item[displayKey]?.toLowerCase().includes(query.toLowerCase());
        });
    }, [items, query, displayKey]);

    const handleChange = (item) => {
        onChange(item?.id || '');
        setQuery('');
    };

    return (
        <div className="discord-combo-box" data-show-image={showImage ? 'true' : 'false'}>
            <Combobox value={selectedItem}
                      onChange={handleChange}
            >
                {({ open }) => (
                    <div>
                        <Combobox.Button 
                            as="div" 
                            className="relative flex items-center"
                            onKeyDown={(e) => {
                                // Allow keyboard input to pass through to the Combobox.Input
                                if (e.key === 'Backspace' || e.key === 'Delete' || e.key.length === 1) {
                                    e.stopPropagation();
                                }
                            }}
                        >
                            <div className="discord-combo-box-image">
                                {selectedItem && (selectedItem[imageKey] || showFallbackInitials) && (
                                    selectedItem[imageKey] ? (
                                        <img
                                            src={selectedItem[imageKey]}
                                            alt={selectedItem[displayKey] || ''}
                                            className="object-cover rounded"
                                        />
                                    ) : (
                                        <div className="bg-[#2b2d31] flex items-center justify-center rounded">
                                            <span className="text-[10px] font-semibold text-[#b5bac1]">
                                                {getInitials(selectedItem[displayKey])}
                                            </span>
                                        </div>
                                    )
                                )}
                            </div>

                            <Combobox.Input
                                onChange={(event) => setQuery(event.target.value)}
                                onBlur={() => setQuery('')}
                                displayValue={(item) => item?.[displayKey] || ''}
                                className={`discord-input discord-text-input w-full`}
                                placeholder={placeholder}
                            />

                            <div className="absolute inset-y-0 right-0 flex items-center pr-2 z-10 pointer-events-none">
                                <svg
                                    className={`h-5 w-5 text-[#87898c] transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/>
                                </svg>
                            </div>
                        </Combobox.Button>

                        <Combobox.Options
                            className="discord-combo-box-options-container absolute mt-1 max-h-60 w-full overflow-auto">
                            {filteredItems.length === 0 && query !== '' ? (
                                <div className="relative cursor-default select-none px-3 py-2 text-sm text-[#87898c]">
                                    {emptyMessage}
                                </div>
                            ) : (
                                filteredItems.map((item) => (
                                    <Combobox.Option
                                        key={item.id}
                                        value={item}
                                        className={({active}) =>
                                            `discord-combo-box-option relative cursor-pointer select-none px-3 py-2 text-sm transition-colors ${
                                                active ? 'bg-[#4752c4] text-white discord-combo-box-option-selected' : 'text-[#dbdee1]'
                                            }`
                                        }
                                    >
                                        {({selected, active}) => (
                                            <div className="flex items-center gap-3">
                                                <div className="discord-combo-box-image">
                                                    {(item[imageKey] || showFallbackInitials) && (
                                                        item[imageKey] ? (
                                                            <img
                                                                src={item[imageKey]}
                                                                alt={item[displayKey] || ''}
                                                                className="object-cover rounded"
                                                            />
                                                        ) : (
                                                            <div className="bg-[#2b2d31] flex items-center justify-center rounded flex-shrink-0">
                                                                <span className="text-[10px] font-semibold text-[#b5bac1]">
                                                                    {getInitials(item[displayKey])}
                                                                </span>
                                                            </div>
                                                        )
                                                    )}
                                                </div>

                                                <span
                                                    className={`block truncate flex-1 ${selected ? 'font-semibold' : 'font-normal'}`}>
                                                    {item[displayKey]}
                                                </span>

                                                {selected && (
                                                    <svg aria-hidden="true" className="discord-combo-box-selected-icon"
                                                         role="img"
                                                         xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none"
                                                         viewBox="0 0 24 24">
                                                        <circle cx="12" cy="12" r="10" fill="white" className=""></circle>
                                                        <path fill="currentColor" fill-rule="evenodd"
                                                              d="M12 23a11 11 0 1 0 0-22 11 11 0 0 0 0 22Zm5.7-13.3a1 1 0 0 0-1.4-1.4L10 14.58l-2.3-2.3a1 1 0 0 0-1.4 1.42l3 3a1 1 0 0 0 1.4 0l7-7Z"
                                                              clip-rule="evenodd" className=""></path>
                                                    </svg>
                                                )}
                                            </div>
                                        )}
                                    </Combobox.Option>
                                ))
                            )}
                        </Combobox.Options>
                    </div>
                )}
            </Combobox>
        </div>
    );
}