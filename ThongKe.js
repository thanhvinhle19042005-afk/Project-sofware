
function thongKeNguoiTheoNamSinh(data) {
    console.log("--- THỐNG KÊ: SỐ LƯỢNG NGƯỜI THEO NĂM SINH ---");
    
    const stats = data.reduce((acc, curr) => {
        const year = new Date(curr.ngaySinh).getFullYear();
        // Nếu năm chưa tồn tại trong object tích lũy, tạo mới = 0
        if (!acc[year]) acc[year] = 0;
        acc[year]++;
        return acc;
    }, {});

    console.table(stats);
    return stats;
}


function thongKeTamTru(data) {
    console.log("--- THỐNG KÊ: TÌNH HÌNH TẠM TRÚ ---");
    
    const today = new Date('2023-08-01');   //sửa date

    const report = {
        tongLuotDangKy: data.length,
        dangTamTru: 0,
        daHetHan: 0
    };

    data.forEach(item => {
        const end = new Date(item.thoiGian.end);
        if (end >= today) {
            report.dangTamTru++;
        } else {
            report.daHetHan++;
        }
    });

    console.table(report);
    return report;
}


function thongKeHoatDong(data) {
    console.log("--- THỐNG KÊ: HOẠT ĐỘNG ---");

    const nguoiThamGia = data.reduce((acc, curr) => {
        const tenHD = curr.ten;
        if (!acc[tenHD]) acc[tenHD] = 0;
        acc[tenHD]++;
        return acc;
    }, {});
    
    console.log(">> Số người tham gia từng hoạt động:");
    console.table(nguoiThamGia);

    const hoatDongTheoThang = data.reduce((acc, curr) => {
        const date = new Date(curr.thoiGian.start);
        const key = `${date.getMonth() + 1}/${date.getFullYear()}`; // VD: "1/2023"
        if (!acc[key]) acc[key] = new Set();
        acc[key].add(curr.ten);
        
        return acc;
    }, {});

    const ketQuaTheoThang = {};
    for (const [thang, setTenHD] of Object.entries(hoatDongTheoThang)) {
        ketQuaTheoThang[thang] = setTenHD.size;
    }

    console.log(">> Số lượng sự kiện tổ chức theo tháng:");
    console.table(ketQuaTheoThang);
}


thongKeNguoiTheoNamSinh(nguoiDan);
console.log("\n");
thongKeTamTru(tamTru);
console.log("\n");
thongKeHoatDong(hoatDong);