import { expect, test } from '@playwright/test';

test('agent studio can start a mock run and show approval state', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByText('智能体前端框架样板')).toBeVisible();
  await page.getByRole('button', { name: '运行示例流程' }).click();
  await expect(page.getByRole('heading', { name: '人工审批' })).toBeVisible();
  await expect(page.getByText('等待人工审批高风险验证命令。')).toBeVisible();
});
