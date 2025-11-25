import {Combobox} from "@headlessui/react";

const { useState, useMemo } = BdApi.React;

export default function DiscordComboBox({ items, value, onChange, placeholder, displayKey = 'name', emptyMessage = 'No items found.' }) {
    const [query, setQuery] = useState('');

    const selectedItem = useMemo(() => {
        return items.find(item => item.id === value) || null;
    }, [items, value]);

    const filteredItems = useMemo(() => {
        if (query === '') return items;
        return items.filter((item) => {
            return item[displayKey]?.toLowerCase().includes(query.toLowerCase());
        });
    }, [items, query, displayKey]);

    return (
        <div className="relative w-full">
            <Combobox value={selectedItem} onChange={(item) => onChange(item?.id || '')}>
                <div className="relative">
                    <div className="relative">
                        <Combobox.Input
                            onChange={(event) => setQuery(event.target.value)}
                            displayValue={(item) => item?.[displayKey] || ''}
                            className="w-full rounded-[3px] bg-[#1e1f22] border-none px-3 py-2.5 text-[15px] text-[#dbdee1] transition-colors placeholder:text-[#87898c] focus:outline-none focus:ring-0 disabled:cursor-not-allowed disabled:opacity-50"
                            placeholder={placeholder}
                        />
                        <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-2">
                            <svg
                                className="h-5 w-5 text-[#87898c]"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </Combobox.Button>
                    </div>
                </div>

                <Combobox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-[3px] bg-[#111214] py-1 shadow-xl focus:outline-none">
                    {filteredItems.length === 0 && query !== '' ? (
                        <div className="relative cursor-default select-none px-3 py-2 text-sm text-[#87898c]">
                            {emptyMessage}
                        </div>
                    ) : (
                        filteredItems.map((item) => (
                            <Combobox.Option
                                key={item.id}
                                value={item}
                                className={({ active }) =>
                                    `relative cursor-pointer select-none px-3 py-2 text-sm transition-colors ${
                                        active ? 'bg-[#4752c4] text-white' : 'text-[#dbdee1]'
                                    }`
                                }
                            >
                                {({ selected, active }) => (
                                    <div className="flex items-center gap-3">
                                        <span className={`block truncate flex-1 ${selected ? 'font-semibold' : 'font-normal'}`}>
                                            {item[displayKey]}
                                        </span>
                                        {selected && (
                                            <svg
                                                className="h-5 w-5 text-white flex-shrink-0"
                                                fill="currentColor"
                                                viewBox="0 0 20 20"
                                            >
                                                <path
                                                    fillRule="evenodd"
                                                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                                    clipRule="evenodd"
                                                />
                                            </svg>
                                        )}
                                    </div>
                                )}
                            </Combobox.Option>
                        ))
                    )}
                </Combobox.Options>
            </Combobox>
        </div>
    );
}