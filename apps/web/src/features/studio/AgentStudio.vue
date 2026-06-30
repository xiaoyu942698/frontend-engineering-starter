<template>
  <section class="studio-page">
    <UiPageHeader
      eyebrow="Agent Studio"
      title="智能体前端框架样板"
      description="同一套设计 token 和能力组件支持任务会话、后台流程编排、运行审计、人工审批和结果产物。"
    >
      <template #actions>
        <el-button :loading="isSyncing" @click="loadSnapshot">同步资源</el-button>
        <el-button type="primary" :loading="isRunning" @click="runWorkflow">运行示例流程</el-button>
      </template>
    </UiPageHeader>

    <section class="studio-overview" aria-label="运行概览">
      <div v-for="item in overviewItems" :key="item.label" class="overview-item" :data-tone="item.tone">
        <span>{{ item.label }}</span>
        <strong>{{ item.value }}</strong>
        <small>{{ item.note }}</small>
      </div>
    </section>

    <UiStateBlock
      v-if="runtimeError"
      state="error"
      title="运行接口异常"
      :description="runtimeError"
      action-label="重试同步"
      compact
      @action="loadSnapshot"
    />

    <UiSurfaceFrame>
      <template #sidebar>
        <UiSurfaceNav :items="surfaceViews" :active-id="activeView" @update:active-id="setActiveView" />
        <UiSection title="运行状态" :meta="activeRunStatus">
          <UiKeyValueList :items="runFacts" />
        </UiSection>
      </template>

      <div class="surface-main">
        <section v-if="activeView === 'session'" class="capability-surface" aria-label="任务会话">
          <div class="surface-section-head">
            <div>
              <h2>任务会话</h2>
              <p>适合智能体产品、桌面端任务执行和 Copilot 类交互。</p>
            </div>
            <div class="surface-meta">
              <strong>{{ workflow.name }}</strong>
              <span>{{ activeRunStatus }}</span>
            </div>
          </div>

          <article class="task-message">
            <span class="message-avatar">你</span>
            <div>
              <div class="message-meta">
                <strong>任务输入</strong>
                <span>{{ workflow.name }}</span>
              </div>
              <p>{{ lastPrompt }}</p>
            </div>
          </article>

          <RunTimeline :events="events" />

          <footer class="session-composer">
            <el-input
              v-model="runPrompt"
              type="textarea"
              resize="none"
              :autosize="{ minRows: 2, maxRows: 4 }"
              placeholder="输入要交给 Agent 的任务"
            />
            <div class="composer-actions">
              <span>MockRuntimeAdapter · 不调用真实 LLM，不读取真实密钥</span>
              <el-button type="primary" :loading="isRunning" @click="runWorkflow">发送</el-button>
            </div>
          </footer>
        </section>

        <section
          v-else-if="activeView === 'workflow'"
          class="capability-surface workflow-surface"
          aria-label="流程编排"
        >
          <div class="surface-section-head">
            <div>
              <h2>流程编排</h2>
              <p>适合后台配置、流程治理、节点状态和执行路径查看。</p>
            </div>
            <div class="surface-meta">
              <strong>{{ workflow.nodes.length }} 节点</strong>
              <span>{{ workflow.edges.length }} 条边</span>
            </div>
          </div>
          <WorkflowCanvas :workflow="workflow" :active-node-id="activeNodeId" />
        </section>

        <section v-else-if="activeView === 'audit'" class="capability-surface audit-surface" aria-label="运行事件">
          <div class="surface-section-head">
            <div>
              <h2>运行事件</h2>
              <p>适合后台架构里的审计、排障、成本分析和运行复盘。</p>
            </div>
            <div class="surface-meta">
              <strong>{{ events.length }} 条</strong>
              <span>{{ activeNodeId || 'no node' }}</span>
            </div>
          </div>
          <RunTimeline :events="events" />
        </section>

        <section v-else class="capability-surface adapter-surface" aria-label="适配器架构">
          <div class="surface-section-head">
            <div>
              <h2>适配器架构</h2>
              <p>面向后台系统和智能体系统的统一运行边界，真实框架通过 RuntimeAdapter 接入。</p>
            </div>
            <div class="surface-meta">
              <strong>MockRuntimeAdapter</strong>
              <span>可替换</span>
            </div>
          </div>

          <div class="adapter-layout">
            <section class="adapter-panel">
              <h3>运行边界</h3>
              <dl>
                <div>
                  <dt>输入</dt>
                  <dd>WorkflowDefinition + 用户任务</dd>
                </div>
                <div>
                  <dt>事件</dt>
                  <dd>RunEvent / SSE</dd>
                </div>
                <div>
                  <dt>人工节点</dt>
                  <dd>HumanApproval</dd>
                </div>
                <div>
                  <dt>输出</dt>
                  <dd>Artifact</dd>
                </div>
              </dl>
            </section>

            <section class="adapter-panel">
              <h3>可接入框架</h3>
              <ul>
                <li>LangGraph：图式工作流和节点状态。</li>
                <li>CrewAI：多 Agent 协作和任务分派。</li>
                <li>Mastra：工具调用、工作流和部署运行时。</li>
                <li>OpenAI Agents SDK / Google ADK：事件流、工具、人工审批。</li>
              </ul>
            </section>

            <section class="adapter-panel adapter-panel-wide">
              <h3>前端约束</h3>
              <p>
                页面组件只消费 contracts 和 RuntimeAdapter，不直接绑定具体智能体框架
                SDK。后台控制台可以使用流程编排和审计 surface，智能体产品可以使用任务会话和审批 surface。
              </p>
            </section>
          </div>
        </section>
      </div>

      <template #inspector>
        <ApprovalGate :approval="approval" @decision="handleDecision" />
        <ArtifactPanel :artifacts="artifacts" />
        <ResourceCatalog :agents="snapshot.agents" :tools="snapshot.tools" />
      </template>
    </UiSurfaceFrame>
  </section>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import type { Artifact, HumanApproval, Run, RunEvent } from '@agent-flow/contracts';
import {
  UiKeyValueList,
  UiPageHeader,
  UiSection,
  UiStateBlock,
  UiSurfaceFrame,
  UiSurfaceNav,
  type UiKeyValueItem,
  type UiSurfaceNavItem
} from '@agent-flow/ui';
import { getApiErrorMessage } from '@/shared/api/errors';
import { MockRuntimeAdapter } from '@/shared/runtime/adapter';
import WorkflowCanvas from './WorkflowCanvas.vue';
import ApprovalGate from './components/ApprovalGate.vue';
import ArtifactPanel from './components/ArtifactPanel.vue';
import ResourceCatalog from './components/ResourceCatalog.vue';
import RunTimeline from './components/RunTimeline.vue';
import { fallbackApproval, fallbackEvents, fallbackSnapshot, getFirstWorkflow } from './fixtures';
import { useRuntimeSnapshotQuery } from './queries/runtime-queries';

type SurfaceView = 'session' | 'workflow' | 'audit' | 'adapter';

const surfaceViews: UiSurfaceNavItem[] = [
  { id: 'session', label: '任务会话', description: '面向智能体产品的对话式执行', meta: 'Agent' },
  { id: 'workflow', label: '流程编排', description: '面向后台配置和运行拓扑', meta: 'Console' },
  { id: 'audit', label: '运行事件', description: '面向审计、排障和复盘', meta: 'Ops' },
  { id: 'adapter', label: '适配器架构', description: '面向不同运行框架的接入边界', meta: 'SDK' }
];

const hashViewMap: Record<string, SurfaceView> = {
  '#studio': 'session',
  '#workflow': 'workflow',
  '#runtime': 'audit',
  '#adapters': 'adapter'
};

const viewHashMap: Record<SurfaceView, string> = {
  session: '#studio',
  workflow: '#workflow',
  audit: '#runtime',
  adapter: '#adapters'
};

const adapter = new MockRuntimeAdapter();
const snapshotQuery = useRuntimeSnapshotQuery(adapter);
const snapshot = computed(() => snapshotQuery.data.value ?? fallbackSnapshot);
const events = ref<RunEvent[]>(fallbackEvents);
const approval = ref<HumanApproval | null>(fallbackApproval);
const activeRun = ref<Run | null>(null);
const artifacts = ref<Artifact[]>([]);
const runPrompt = ref('检查 Agent Flow 模板是否满足发布标准');
const lastPrompt = ref(runPrompt.value);
const activeView = ref<SurfaceView>('session');
const isRunning = ref(false);
const operationError = ref<string | null>(null);

const workflow = computed(() => getFirstWorkflow(snapshot.value));
const activeRunStatus = computed(() => activeRun.value?.status ?? 'preview');
const activeNodeId = computed(() => events.value.at(-1)?.nodeId ?? null);
const isSyncing = computed(() => snapshotQuery.isFetching.value);
const runtimeError = computed(() => {
  if (operationError.value) return operationError.value;
  if (snapshotQuery.error.value) return getApiErrorMessage(snapshotQuery.error.value);
  return null;
});
const runFacts = computed<UiKeyValueItem[]>(() => [
  { label: '事件', value: `${events.value.length} 条`, tone: 'primary' },
  { label: '审批', value: approval.value?.status ?? 'none', tone: approval.value ? 'warning' : 'neutral' },
  { label: '产物', value: `${artifacts.value.length} 个`, tone: artifacts.value.length > 0 ? 'success' : 'neutral' }
]);
const overviewItems = computed(() => [
  { label: 'Runtime', value: activeRunStatus.value, note: 'Mock adapter', tone: 'primary' },
  { label: 'Workflow', value: workflow.value.name, note: `${workflow.value.nodes.length} nodes`, tone: 'neutral' },
  {
    label: 'Approval',
    value: approval.value?.status ?? 'none',
    note: approval.value?.title ?? 'no gate',
    tone: approval.value ? 'warning' : 'neutral'
  },
  {
    label: 'Artifacts',
    value: artifacts.value.length,
    note: 'Markdown / JSON / table',
    tone: artifacts.value.length > 0 ? 'success' : 'neutral'
  }
]);

function syncViewFromHash() {
  activeView.value = hashViewMap[window.location.hash || '#studio'] ?? activeView.value;
}

function setActiveView(id: string) {
  if (id === 'session' || id === 'workflow' || id === 'audit' || id === 'adapter') {
    activeView.value = id;
    window.location.hash = viewHashMap[id];
  }
}

async function loadSnapshot() {
  operationError.value = null;
  await snapshotQuery.refetch();
}

async function runWorkflow() {
  isRunning.value = true;
  operationError.value = null;

  try {
    lastPrompt.value = runPrompt.value.trim() || '检查 Agent Flow 模板是否满足发布标准';
    const result = await adapter.startRun(workflow.value, lastPrompt.value);
    activeRun.value = result.run;
    events.value = result.events;
    approval.value = result.approval;
    artifacts.value = [];
  } catch (error) {
    operationError.value = getApiErrorMessage(error);
  } finally {
    isRunning.value = false;
  }
}

async function handleDecision(decision: 'approved' | 'rejected') {
  if (!activeRun.value || !approval.value) return;
  operationError.value = null;

  try {
    const result = await adapter.submitHumanDecision(activeRun.value.id, approval.value.id, decision);
    activeRun.value = result.run;
    events.value = result.events;
    approval.value = null;
    artifacts.value = result.artifacts ?? [];
  } catch (error) {
    operationError.value = getApiErrorMessage(error);
  }
}

onMounted(() => {
  syncViewFromHash();
  window.addEventListener('hashchange', syncViewFromHash);
});

onBeforeUnmount(() => {
  window.removeEventListener('hashchange', syncViewFromHash);
});
</script>
