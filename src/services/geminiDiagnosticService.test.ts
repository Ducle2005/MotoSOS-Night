import assert from 'node:assert/strict';
import test from 'node:test';
import {
  fallbackDiagnose,
  fallbackProcessMessage,
  mapDiagnosticToIssueType,
  maskApiKey,
} from './geminiDiagnosticService';

test('geminiDiagnosticService - maskApiKey masks keys cleanly for UI display', () => {
  const mockKey = 'AQ.Ab8MOCKKEYTESTSAMPLESECRETVALUE1234567890xyFw';
  const masked = maskApiKey(mockKey);

  assert.ok(masked.startsWith('AQ.Ab8'));
  assert.ok(masked.endsWith('xyFw'));
  assert.ok(masked.includes('••••••••'));
  assert.ok(!masked.includes('MOCKKEYTEST'));

  assert.equal(maskApiKey(''), '');
  assert.equal(maskApiKey('AIzaSy12345'), 'AIzaSy••••••••2345');
});

test('geminiDiagnosticService - mapDiagnosticToIssueType maps to valid IssueType', () => {
  assert.equal(mapDiagnosticToIssueType('battery'), 'battery_jump');
  assert.equal(mapDiagnosticToIssueType('tire'), 'flat_tire');
  assert.equal(mapDiagnosticToIssueType('engine'), 'engine_dead');
  assert.equal(mapDiagnosticToIssueType('fuel'), 'out_of_fuel');
  assert.equal(mapDiagnosticToIssueType('other'), 'other');
});

test('geminiDiagnosticService - fallbackDiagnose categorizes issues accurately', () => {
  const battery = fallbackDiagnose('Xe bấm đề kêu tạch tạch');
  assert.equal(battery.recommendedServiceId, 'battery');

  const tire = fallbackDiagnose('Bánh sau bị lủng lốp xì hết hơi');
  assert.equal(tire.recommendedServiceId, 'tire');

  const engine = fallbackDiagnose('Xe đi trời mưa ngập nước chết máy');
  assert.equal(engine.recommendedServiceId, 'engine');

  const fuel = fallbackDiagnose('Xe cạn xăng giữa đường');
  assert.equal(fuel.recommendedServiceId, 'fuel');

  const belt = fallbackDiagnose('Lên ga máy gầm mà xe không chạy');
  assert.equal(belt.recommendedServiceId, 'engine');
});

test('geminiDiagnosticService - fallbackProcessMessage surfaces error reason when provided', () => {
  const resWithErr = fallbackProcessMessage('Xe đề không lên', 'HTTP 403 API disabled');
  assert.ok(resWithErr.messageText.includes('[Lưu ý kết nối: HTTP 403 API disabled]'));

  const greeting = fallbackProcessMessage('Xin chào bạn');
  assert.equal(greeting.replyType, 'chat');
  assert.ok(greeting.messageText.includes('Kỹ sư trưởng MotoSOS'));
});
