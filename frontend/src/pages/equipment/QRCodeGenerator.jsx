import React, { useState, useEffect } from 'react';
import { apiEndpoints } from '../../api';

function QRCodeGenerator({ user }) {
  const [tree, setTree] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEquipment, setSelectedEquipment] = useState([]);
  const [selectAll, setSelectAll] = useState(false);

  useEffect(() => {
    const loadTree = async () => {
      try {
        const res = await fetch(apiEndpoints.getTree());
        const data = await res.json();
        setTree(data);
      } catch (err) {
        console.error('Error loading tree:', err);
      } finally {
        setLoading(false);
      }
    };
    loadTree();
  }, []);

  // Get all equipment in a flattened array
  const getAllEquipment = () => {
    let equipment = [];
    tree.forEach(building => {
      if (building.rooms) {
        building.rooms.forEach(room => {
          if (room.instruments) {
            equipment = equipment.concat(
              room.instruments.map(inst => ({
                ...inst,
                room_name: room.name,
                building_name: building.name
              }))
            );
          }
        });
      }
    });
    return equipment;
  };

  const allEquipment = getAllEquipment();

  const handleSelectEquipment = (id) => {
    if (selectedEquipment.includes(id)) {
      setSelectedEquipment(selectedEquipment.filter(e => e !== id));
    } else {
      setSelectedEquipment([...selectedEquipment, id]);
    }
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedEquipment([]);
    } else {
      setSelectedEquipment(allEquipment.map(e => e.id));
    }
    setSelectAll(!selectAll);
  };

  const handlePrintSelected = () => {
    const selectedItems = allEquipment.filter(e => selectedEquipment.includes(e.id));
    if (selectedItems.length === 0) {
      alert('เลือกเครื่องมือที่ต้องการปริ้นท์');
      return;
    }

    const printWindow = window.open('', '', 'width=1000,height=800');
    let html = `
      <html>
      <head>
        <title>QR Codes - Print</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: Arial, sans-serif; padding: 20px; background: white; }
          .title { text-align: center; font-size: 24px; font-weight: bold; margin-bottom: 20px; }
          .grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
          .card { border: 1px solid #ddd; padding: 15px; text-align: center; page-break-inside: avoid; }
          .card h3 { font-size: 14px; margin-bottom: 5px; }
          .card p { font-size: 11px; color: #666; margin: 3px 0; }
          .qr { margin: 10px 0; }
          .qr img { max-width: 120px; height: 120px; }
          .token { font-family: monospace; font-size: 9px; color: #999; word-break: break-all; margin-top: 5px; }
          @media print {
            body { padding: 0; }
            .grid { gap: 10px; }
            .card { padding: 10px; }
          }
        </style>
      </head>
      <body>
        <div class="title">🏢 QR Codes - เครื่องมือ</div>
        <div class="grid">
    `;

    selectedItems.forEach(item => {
      html += `
        <div class="card">
          <h3>${item.name}</h3>
          <p><strong>อาคาร:</strong> ${item.building_name}</p>
          <p><strong>ห้อง:</strong> ${item.room_name}</p>
          <p><strong>รหัส:</strong> ${item.code}</p>
          <div class="qr">
            <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${item.qr_token}" alt="QR" />
          </div>
          <div class="token">${item.qr_token}</div>
        </div>
      `;
    });

    html += `
        </div>
      </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
    setTimeout(() => printWindow.print(), 500);
  };

  if (loading) {
    return <div className="p-8 text-center text-gray-500">กำลังโหลดข้อมูล...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">🔷 สร้าง QR Code เครื่องมือ</h1>
            <p className="text-gray-500 text-sm mt-1">เลือกเครื่องมือที่ต้องการสร้าง QR Code เพื่อติดกับเครื่องมือ</p>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-xs text-gray-600 font-bold mb-1">เครื่องมือทั้งหมด</p>
            <p className="text-2xl font-bold text-gray-900">{allEquipment.length}</p>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-xs text-blue-600 font-bold mb-1">เลือกแล้ว</p>
            <p className="text-2xl font-bold text-blue-600">{selectedEquipment.length}</p>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <p className="text-xs text-purple-600 font-bold mb-1">ยังไม่เลือก</p>
            <p className="text-2xl font-bold text-purple-600">{allEquipment.length - selectedEquipment.length}</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <p className="text-xs text-green-600 font-bold mb-1">ขนาดกระดาษ (A4)</p>
            <p className="text-2xl font-bold text-green-600">3 cate</p>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={selectAll}
              onChange={handleSelectAll}
              className="w-5 h-5 cursor-pointer"
            />
            <span className="font-bold text-gray-900">เลือกทั้งหมด</span>
          </label>
          <span className="text-sm text-gray-500">
            เลือก {selectedEquipment.length} จาก {allEquipment.length} เครื่องมือ
          </span>
        </div>
        <button
          onClick={handlePrintSelected}
          disabled={selectedEquipment.length === 0}
          className={`px-6 py-3 rounded-lg font-bold flex items-center gap-2 text-sm ${
            selectedEquipment.length === 0
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-green-600 text-white hover:bg-green-700'
          }`}
        >
          🖨️ ปริ้นท์ QR Code ({selectedEquipment.length})
        </button>
      </div>

      {/* Equipment List */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase w-12">
                  <input
                    type="checkbox"
                    checked={selectAll}
                    onChange={handleSelectAll}
                    className="w-4 h-4 cursor-pointer"
                  />
                </th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">เครื่องมือ</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">อาคาร</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">ห้อง</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">รหัส</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">ราคา</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {allEquipment.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-gray-400 font-medium">
                    ไม่มีเครื่องมือในระบบ
                  </td>
                </tr>
              ) : (
                allEquipment.map(equipment => (
                  <tr key={equipment.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedEquipment.includes(equipment.id)}
                        onChange={() => handleSelectEquipment(equipment.id)}
                        className="w-4 h-4 cursor-pointer"
                      />
                    </td>
                    <td className="px-6 py-4 font-bold text-gray-900">{equipment.name}</td>
                    <td className="px-6 py-4 text-gray-700">{equipment.building_name}</td>
                    <td className="px-6 py-4 text-gray-700">{equipment.room_name}</td>
                    <td className="px-6 py-4 text-gray-600 font-mono text-sm">{equipment.code}</td>
                    <td className="px-6 py-4 text-gray-700">
                      {equipment.price ? `฿${equipment.price.toLocaleString()}` : '-'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
        <h3 className="font-bold text-blue-900 mb-3">📖 วิธีการใช้งาน</h3>
        <ol className="text-sm text-blue-900 space-y-2 list-decimal list-inside">
          <li>เลือกเครื่องมือที่ต้องการสร้าง QR Code หรือ <strong>เลือกทั้งหมด</strong></li>
          <li>คลิกปุ่ม <strong>🖨️ ปริ้นท์ QR Code</strong></li>
          <li>กระดาษจะแสดง 3 QR codes ต่อแถว พอดีกับการติดบนเครื่องมือ</li>
          <li>พิมพ์บนสติกเกอร์ (Sticker) และนำไปติดบนเครื่องมือ</li>
          <li>นักเรียนสามารถสแกน QR code เพื่อเข้าใช้งานเครื่องมือได้</li>
        </ol>
      </div>
    </div>
  );
}

export default QRCodeGenerator;
