import { describe, it } from 'node:test';
import assert from 'node:assert';
import {
  askAiMechanic,
  diagnoseMotorbikeIssue,
  fallbackDiagnose,
  fallbackProcessMessage,
  mapDiagnosticToIssueType,
} from './geminiMechanicService';

describe('geminiMechanicService', () => {
  it('fallbackProcessMessage handles Group 1 greetings with chat reply and no diagnosis', () => {
    const res = fallbackProcessMessage('Xin chào');
    assert.strictEqual(res.replyType, 'chat');
    assert.strictEqual(res.diagnosis, undefined);
    assert.ok(res.messageText.includes('Kỹ sư trưởng MotoSOS'));
  });

  it('fallbackProcessMessage handles Group 2 pricing/info questions with informative chat reply', () => {
    const res = fallbackProcessMessage('Thay bình ắc quy giá bao nhiêu tiền');
    assert.strictEqual(res.replyType, 'chat');
    assert.strictEqual(res.diagnosis, undefined);
    assert.ok(res.messageText.includes('ắc quy'));
    assert.ok(res.messageText.includes('90.000đ'));
  });

  it('fallbackProcessMessage handles Group 3 breakdown symptoms with technical diagnosis', () => {
    const res = fallbackProcessMessage('Xe bấm đề chỉ kêu tạch tạch không nổ máy');
    assert.strictEqual(res.replyType, 'diagnosis');
    assert.ok(res.diagnosis !== undefined);
    assert.strictEqual(res.diagnosis?.recommendedServiceId, 'battery');
    assert.strictEqual(res.diagnosis?.estimatedPrice, '90.000đ');
  });

  it('fallbackDiagnose accurately identifies battery issues', () => {
    const diag = fallbackDiagnose('Xe bấm đề chỉ kêu tạch tạch không nổ máy');
    assert.strictEqual(diag.recommendedServiceId, 'battery');
    assert.ok(diag.summary.includes('khởi động') || diag.summary.includes('ắc quy'));
    assert.ok(diag.probableCauses.length >= 2);
    assert.strictEqual(diag.estimatedPrice, '90.000đ');
  });

  it('fallbackDiagnose accurately identifies flat tire issues', () => {
    const diag = fallbackDiagnose('Bánh sau bị lủng cán phải đinh xì hết hơi');
    assert.strictEqual(diag.recommendedServiceId, 'tire');
    assert.strictEqual(diag.estimatedPrice, '85.000đ');
    assert.ok(diag.safetyWarning.includes('lốp'));
  });

  it('fallbackDiagnose accurately identifies water/engine stall issues', () => {
    const diag = fallbackDiagnose('Xe lội qua vũng nước ngập xong chết máy');
    assert.strictEqual(diag.recommendedServiceId, 'engine');
    assert.strictEqual(diag.estimatedPrice, '120.000đ');
  });

  it('fallbackDiagnose accurately identifies out of fuel issues', () => {
    const diag = fallbackDiagnose('Xe hết xăng giữa đường');
    assert.strictEqual(diag.recommendedServiceId, 'fuel');
    assert.strictEqual(diag.estimatedPrice, '80.000đ');
  });

  it('fallbackDiagnose accurately identifies CVT belt issues', () => {
    const diag = fallbackDiagnose('Xe ga rồ ga lên ga nhưng bánh không quay đứt dây curoa');
    assert.strictEqual(diag.recommendedServiceId, 'engine');
    assert.ok(diag.summary.includes('CVT') || diag.summary.includes('curoa'));
  });

  it('mapDiagnosticToIssueType maps to system IssueType correctly', () => {
    assert.strictEqual(mapDiagnosticToIssueType('battery'), 'battery_jump');
    assert.strictEqual(mapDiagnosticToIssueType('tire'), 'flat_tire');
    assert.strictEqual(mapDiagnosticToIssueType('engine'), 'engine_dead');
    assert.strictEqual(mapDiagnosticToIssueType('fuel'), 'out_of_fuel');
    assert.strictEqual(mapDiagnosticToIssueType('other'), 'other');
  });

  it('askAiMechanic and diagnoseMotorbikeIssue safely fall back when no API key is provided', async () => {
    const res = await askAiMechanic('Bấm đề không lên');
    assert.strictEqual(res.replyType, 'diagnosis');
    assert.strictEqual(res.diagnosis?.recommendedServiceId, 'battery');

    const diag = await diagnoseMotorbikeIssue('Bấm đề không lên');
    assert.strictEqual(diag.recommendedServiceId, 'battery');
  });
});
