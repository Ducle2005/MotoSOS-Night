import type { MechanicDiagnosis } from './geminiMechanicService';

export const BATTERY_DIAGNOSIS: MechanicDiagnosis = {
  summary: 'Hệ thống khởi động hoặc bình ắc quy bị sụt áp, không đủ dòng xả để quay củ đề động cơ.',
  probableCauses: [
    { name: 'Bình ắc quy yếu điện hoặc đã hết hạn sử dụng', probability: '80%' },
    { name: 'Rơ-le đề hoặc chổi than củ đề bị kẹt / mòn', probability: '15%' },
    { name: 'Lỏng cọc bình hoặc đứt cầu chì nguồn chính', probability: '5%' },
  ],
  quickChecks: [
    'Bật khóa điện và bấm còi hoặc bật xi-nhan để kiểm tra cường độ điện.',
    'Gạt chân chống cạnh lên hết nấc để nhả công tắc ngắt mass an toàn.',
    'Nếu xe có cần đạp nổ (Wave/Future), thử đạp mồi 3-5 cái dứt khoát.',
  ],
  safetyWarning: 'Không bấm giữ nút đề liên tục quá 3 giây để tránh cháy củ đề và phồng rộp ắc quy.',
  recommendedServiceId: 'battery',
  recommendedServiceName: 'Kích bình & Đo dòng sạc',
  estimatedPrice: '90.000đ',
};

export const TIRE_DIAGNOSIS: MechanicDiagnosis = {
  summary: 'Lốp xe bị cán đinh hoặc rách mép van làm tụt áp suất hơi nhanh, gây đảo tay lái nguy hiểm.',
  probableCauses: [
    { name: 'Cán phải đinh nhọn hoặc vật sắc nhọn trên mặt đường', probability: '85%' },
    { name: 'Hở chân van hoặc biến dạng mép vành mâm xe', probability: '10%' },
    { name: 'Lốp quá mòn dẫn đến nứt bố vải bên trong', probability: '5%' },
  ],
  quickChecks: [
    'Dắt xe vào sát lề đường hoặc Trạm An Toàn có ánh sáng đèn.',
    'Dựng chân chống đứng, xoay đều bánh tìm vị trí ghim đinh hoặc lỗ xì.',
    'Không tự ý rút đinh ra nếu chưa có dụng cụ vá để tránh xẹp tức thì.',
  ],
  safetyWarning: 'Tuyệt đối không ráng chạy xe khi lốp đã xẹp lép vì sẽ nát ruột xe và có thể ngã xe.',
  recommendedServiceId: 'tire',
  recommendedServiceName: 'Vá lốp ép nấm tận nơi',
  estimatedPrice: '85.000đ',
};

export const ENGINE_DIAGNOSIS: MechanicDiagnosis = {
  summary: 'Động cơ bị mất tia lửa điện hoặc nước lọt vào buồng đốt/lọc gió làm ướt bugi đánh lửa.',
  probableCauses: [
    { name: 'Bugi bị ẩm ướt hoặc bám muội than mất khả năng đánh lửa', probability: '75%' },
    { name: 'Nước lọt vào ống pô hoặc bầu lọc gió sau khi đi ngập', probability: '20%' },
    { name: 'Chập cuộn điện phát hoặc hỏng chụp bugi cao áp', probability: '5%' },
  ],
  quickChecks: [
    'Tắt chìa khóa ngay nếu vừa qua vùng nước ngập, không cố bấm đề.',
    'Dựng chống đứng, nâng đầu xe để nước đọng trong ống pô chảy ra ngoài.',
    'Tháo chụp bugi lau thật khô sạch nước trước khi khởi động lại.',
  ],
  safetyWarning: 'Không bấm đề liên tục sau khi xe ngập nước để tránh hiện tượng thủy kích cong tay biên.',
  recommendedServiceId: 'engine',
  recommendedServiceName: 'Cứu hộ chết máy & Bugi',
  estimatedPrice: '120.000đ',
};

export const FUEL_DIAGNOSIS: MechanicDiagnosis = {
  summary: 'Bình nhiên liệu cạn đáy khiến bơm xăng không thể cung cấp nhiên liệu cho buồng đốt.',
  probableCauses: [
    { name: 'Hết sạch xăng trong bình chứa chính', probability: '90%' },
    { name: 'Phao xăng bị kẹt báo ảo mức nhiên liệu trên đồng hồ', probability: '10%' },
  ],
  quickChecks: [
    'Mở nắp bình xăng, lắc nhẹ xe nghe tiếng sóng sánh nhiên liệu.',
    'Bật khóa điện kiểm tra vạch báo xăng nhấp nháy chữ E cảnh báo.',
  ],
  safetyWarning: 'Chạy kiệt xăng trên xe Fi có thể làm nóng và cháy mô-tơ bơm xăng ngâm đáy bình.',
  recommendedServiceId: 'fuel',
  recommendedServiceName: 'Giao 2L xăng RON 95 tận nơi',
  estimatedPrice: '80.000đ',
};

export const BELT_DIAGNOSIS: MechanicDiagnosis = {
  summary: 'Động cơ vẫn nổ nhưng bộ truyền động vô cấp CVT (dây curoa) hoặc nhông sên dĩa bị đứt/trượt.',
  probableCauses: [
    { name: 'Đứt dây curoa truyền động vô cấp hoặc tuột sên tải', probability: '80%' },
    { name: 'Mòn trượt bố ba càng hoặc cháy chuông nồi sau', probability: '15%' },
    { name: 'Kẹt bi nồi văng hoặc vỡ puly truyền động', probability: '5%' },
  ],
  quickChecks: [
    'Tắt máy xe, dắt xe kiểm tra bánh sau quay tự do hay bị kẹt.',
    'Lên ga nhẹ nếu máy gầm to mà bánh không lăn thì đã đứt truyền động.',
  ],
  safetyWarning: 'Dây curoa đứt có thể cuộn vào trục láp gây khóa bánh sau bất ngờ, cần dắt sát lề.',
  recommendedServiceId: 'engine',
  recommendedServiceName: 'Khắc phục truyền động & Curoa',
  estimatedPrice: '120.000đ',
};

export const GENERAL_DIAGNOSIS: MechanicDiagnosis = {
  summary: 'Xe đang gặp sự cố cơ học hoặc hệ thống điện điều khiển cần thợ chuyên môn kiểm tra trực tiếp.',
  probableCauses: [
    { name: 'Sự cố cơ khí hoặc hệ thống điện điều khiển phức hợp', probability: '60%' },
    { name: 'Cảm biến an toàn chập chờn hoặc hệ thống phanh bị kẹt', probability: '40%' },
  ],
  quickChecks: [
    'Dắt xe vào khu vực an toàn có ánh sáng đèn hoặc Trạm An Toàn 24/7.',
    'Quan sát đèn báo lỗi động cơ (FI) màu vàng trên mặt đồng hồ.',
    'Kiểm tra mùi khét lạ hoặc rò rỉ dung dịch dưới gầm xe.',
  ],
  safetyWarning: 'Nếu phát hiện mùi khét hoặc rò rỉ xăng, hãy tắt khóa điện ngay và đứng cách xa xe.',
  recommendedServiceId: 'other',
  recommendedServiceName: 'Thợ kiểm tra & Báo giá tại chỗ',
  estimatedPrice: '50.000đ',
};
