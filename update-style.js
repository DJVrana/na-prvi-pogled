import fs from 'fs';

const filePath = 'src/pages/AdminDashboard.tsx';
let content = fs.readFileSync(filePath, 'utf8');
const isCRLF = content.includes('\r\n');
let norm = content.replace(/\r\n/g, '\n');

const oldBlock = `                    <div className="flex flex-col gap-2 justify-center p-3 rounded-lg bg-white border border-gray-200">
                      <span className="text-xs font-semibold text-gray-700">Ručno zatvaranje prijava po spolu:</span>
                      <div className="flex items-center gap-4">
                        <label className="inline-flex items-center gap-1.5 text-xs text-gray-700 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={!!newEvent.closeRegistrationsM}
                            onChange={e => setNewEvent({ ...newEvent, closeRegistrationsM: e.target.checked })}
                            className="rounded text-brand focus:ring-brand"
                          />
                          <span>Zatvori muške prijave (rasprodano)</span>
                        </label>
                        <label className="inline-flex items-center gap-1.5 text-xs text-gray-700 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={!!newEvent.closeRegistrationsZ}
                            onChange={e => setNewEvent({ ...newEvent, closeRegistrationsZ: e.target.checked })}
                            className="rounded text-brand focus:ring-brand"
                          />
                          <span>Zatvori ženske prijave (rasprodano)</span>
                        </label>
                      </div>
                    </div>`;

const newBlock = `                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">Ručno zatvaranje prijava po spolu</label>
                      <div className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white flex items-center gap-4 text-xs h-[42px]">
                        <label className="inline-flex items-center gap-1.5 cursor-pointer select-none text-gray-700 hover:text-gray-900">
                          <input
                            type="checkbox"
                            checked={!!newEvent.closeRegistrationsM}
                            onChange={e => setNewEvent({ ...newEvent, closeRegistrationsM: e.target.checked })}
                            className="rounded border-gray-300 text-brand focus:ring-brand"
                          />
                          <span className={newEvent.closeRegistrationsM ? 'font-bold text-red-600' : ''}>
                            Zatvori muške (rasprodano)
                          </span>
                        </label>
                        <span className="text-gray-300">|</span>
                        <label className="inline-flex items-center gap-1.5 cursor-pointer select-none text-gray-700 hover:text-gray-900">
                          <input
                            type="checkbox"
                            checked={!!newEvent.closeRegistrationsZ}
                            onChange={e => setNewEvent({ ...newEvent, closeRegistrationsZ: e.target.checked })}
                            className="rounded border-gray-300 text-brand focus:ring-brand"
                          />
                          <span className={newEvent.closeRegistrationsZ ? 'font-bold text-red-600' : ''}>
                            Zatvori ženske (rasprodano)
                          </span>
                        </label>
                      </div>
                    </div>`;

if (!norm.includes(oldBlock)) {
  console.error("Target block not found!");
  process.exit(1);
}

norm = norm.replace(oldBlock, newBlock);
const finalContent = isCRLF ? norm.replace(/\n/g, '\r\n') : norm;
fs.writeFileSync(filePath, finalContent, 'utf8');
console.log("Successfully updated styling in AdminDashboard.tsx!");

