/**
 * Datart
 *
 * Copyright 2021
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { ExclamationCircleOutlined } from '@ant-design/icons';
import { Modal } from 'antd';
import { PageInfo } from 'app/pages/MainPage/pages/ViewPage/slice/types';
import { urlSearchTransfer } from 'app/pages/MainPage/pages/VizPage/utils';
import { ChartMouseEventParams } from 'app/types/DatartChartBase';
import { ControllerFacadeTypes } from 'app/types/FilterControlPanel';
import React, { FC, useCallback, useContext } from 'react';
import { useDispatch } from 'react-redux';
import { useHistory } from 'react-router';
import { BoardContext } from '../../contexts/BoardContext';
import { WidgetContext } from '../../contexts/WidgetContext';
import {
  WidgetMethodContext,
  WidgetMethodContextProps,
} from '../../contexts/WidgetMethodContext';
import { boardActions } from '../../pages/Board/slice';
import {
  getChartWidgetDataAsync,
  getWidgetDataAsync,
} from '../../pages/Board/slice/thunk';
import {
  BoardLinkFilter,
  Widget,
  WidgetContentChartType,
  WidgetType,
} from '../../pages/Board/slice/types';
import {
  editBoardStackActions,
  editDashBoardInfoActions,
  editWidgetInfoActions,
} from '../../pages/BoardEditor/slice';
import {
  closeJumpAction,
  closeLinkageAction,
  editChartInWidgetAction,
} from '../../pages/BoardEditor/slice/actions/actions';
import { editWidgetsQueryAction } from '../../pages/BoardEditor/slice/actions/controlActions';
import {
  getEditChartWidgetDataAsync,
  getEditWidgetDataAsync,
} from '../../pages/BoardEditor/slice/thunk';
import { widgetActionType } from '../WidgetToolBar/config';

const { confirm } = Modal;
export const WidgetMethodProvider: FC<{ widgetId: string }> = ({
  widgetId,
  children,
}) => {
  const { boardId, editing, renderMode, orgId } = useContext(BoardContext);
  const widget = useContext(WidgetContext);
  const dispatch = useDispatch();
  const history = useHistory();

  // deleteWidget
  const onWidgetDelete = useCallback(
    (type: WidgetType, wid: string) => {
      if (type === 'container') {
        confirm({
          // TODO i18n
          title: '确认删除',
          icon: <ExclamationCircleOutlined />,
          content: '该组件内的组件也会被删除,确认是否删除？',
          onOk() {
            dispatch(editBoardStackActions.deleteWidgets([wid]));
          },
          onCancel() {},
        });
        return;
      }
      if (type === 'query') {
        dispatch(editBoardStackActions.changeBoardHasQueryControl(false));
      }
      if (type === 'reset') {
        dispatch(editBoardStackActions.changeBoardHasResetControl(false));
      }
      dispatch(editBoardStackActions.deleteWidgets([wid]));

      if (type === 'controller') {
        dispatch(editWidgetsQueryAction({ boardId }));
      }
    },
    [dispatch, boardId],
  );
  const onWidgetEdit = useCallback(
    (widget: Widget, wid: string) => {
      const type = widget.config.type;
      switch (type) {
        case 'chart':
          const chartType = widget.config.content.type;
          dispatch(
            editChartInWidgetAction({
              orgId,
              widgetId: wid,
              chartName: widget.config.name,
              dataChartId: widget.datachartId,
              chartType: chartType as WidgetContentChartType,
            }),
          );
          break;
        case 'controller':
          dispatch(
            editDashBoardInfoActions.changeControllerPanel({
              type: 'edit',
              widgetId: wid,
              controllerType: widget.config.content
                .type as ControllerFacadeTypes,
            }),
          );
          break;
        case 'container':
          dispatch(
            editWidgetInfoActions.openWidgetEditing({
              id: wid,
            }),
          );
          dispatch(editDashBoardInfoActions.changeShowBlockMask(false));
          break;
        case 'media':
          dispatch(
            editWidgetInfoActions.openWidgetEditing({
              id: wid,
            }),
          );
          break;
        default:
          break;
      }
    },

    [dispatch, orgId],
  );
  const onWidgetFullScreen = useCallback(
    (editing: boolean, recordId: string, itemId: string) => {
      if (editing) {
      } else {
        dispatch(
          boardActions.updateFullScreenPanel({
            recordId,
            itemId,
          }),
        );
      }
    },
    [dispatch],
  );
  const onWidgetGetData = useCallback(
    (boardId: string, widgetId: string) => {
      if (editing) {
        dispatch(getEditWidgetDataAsync({ widgetId }));
      } else {
        dispatch(getWidgetDataAsync({ boardId, widgetId, renderMode }));
      }
    },
    [dispatch, editing, renderMode],
  );
  const onMakeLinkage = useCallback(
    (widgetId: string) => {
      dispatch(
        editDashBoardInfoActions.changeLinkagePanel({
          type: 'add',
          widgetId,
        }),
      );
    },
    [dispatch],
  );
  const onMakeJump = useCallback(
    (widgetId: string) => {
      dispatch(
        editDashBoardInfoActions.changeJumpPanel({ visible: true, widgetId }),
      );
    },
    [dispatch],
  );
  const onToggleLinkage = useCallback(
    (toggle: boolean) => {
      if (editing) {
        dispatch(
          editWidgetInfoActions.changeWidgetInLinking({
            boardId,
            widgetId,
            toggle,
          }),
        );
      } else {
        dispatch(
          boardActions.changeWidgetInLinking({
            boardId,
            widgetId,
            toggle,
          }),
        );
      }
    },
    [boardId, dispatch, editing, widgetId],
  );
  const onChangeBoardFilter = useCallback(
    (filters?: BoardLinkFilter[]) => {
      if (editing) {
        dispatch(
          editDashBoardInfoActions.changeBoardLinkFilter({
            boardId: boardId,
            triggerId: widgetId,
            linkFilters: filters,
          }),
        );
      } else {
        dispatch(
          boardActions.changeBoardLinkFilter({
            boardId: boardId,
            triggerId: widgetId,
            linkFilters: filters,
          }),
        );
      }
    },

    [editing, dispatch, boardId, widgetId],
  );

  const onClearLinkage = useCallback(
    (widget: Widget) => {
      onToggleLinkage(false);
      onChangeBoardFilter();

      const linkRelations = widget.relations.filter(
        re => re.config.type === 'widgetToWidget',
      );
      setTimeout(() => {
        linkRelations.forEach(link => {
          onWidgetGetData(boardId, link.targetId);
        });
      }, 60);
    },
    [onToggleLinkage, onChangeBoardFilter, onWidgetGetData, boardId],
  );

  const toLinkingWidgets = useCallback(
    (widget: Widget, params: ChartMouseEventParams) => {
      const linkRelations = widget.relations.filter(
        re => re.config.type === 'widgetToWidget',
      );

      const boardFilters = linkRelations.map(re => {
        let linkageFieldName: string =
          re?.config?.widgetToWidget?.triggerColumn || '';

        const filter: BoardLinkFilter = {
          triggerWidgetId: widget.id,
          triggerValue:
            (params?.data?.rowData?.[linkageFieldName] as string) || '',
          triggerDataChartId: widget.datachartId,
          linkerWidgetId: re.targetId,
        };
        return filter;
      });

      if (editing) {
        dispatch(
          editDashBoardInfoActions.changeBoardLinkFilter({
            boardId: boardId,
            triggerId: widgetId,
            linkFilters: boardFilters,
          }),
        );
      } else {
        dispatch(
          boardActions.changeBoardLinkFilter({
            boardId: boardId,
            triggerId: widget.id,
            linkFilters: boardFilters,
          }),
        );
      }

      onToggleLinkage(true);
      setTimeout(() => {
        boardFilters.forEach(f => {
          onWidgetGetData(boardId, f.linkerWidgetId);
        });
      }, 60);
    },
    [boardId, dispatch, editing, onToggleLinkage, onWidgetGetData, widgetId],
  );
  const clickJump = useCallback(
    (values: { widget: Widget; params: ChartMouseEventParams }) => {
      const { widget, params } = values;
      const jumpConfig = widget.config?.jumpConfig;
      const targetId = jumpConfig?.target?.relId;
      const jumpFieldName: string = jumpConfig?.field?.jumpFieldName || '';

      if (typeof jumpConfig?.filter === 'object') {
        const searchParamsStr = urlSearchTransfer.toUrlString({
          [jumpConfig?.filter?.filterId]:
            (params?.data?.rowData?.[jumpFieldName] as string) || '',
        });
        if (targetId) {
          history.push(
            `/organizations/${orgId}/vizs/${targetId}?${searchParamsStr}`,
          );
        }
      }
    },
    [history, orgId],
  );
  const getTableChartData = useCallback(
    (options: { widget: Widget; params: any }) => {
      const { params } = options;
      const pageInfo: Partial<PageInfo> = {
        pageNo: params.value.page,
      };
      if (editing) {
        dispatch(
          getEditChartWidgetDataAsync({
            widgetId,
            option: {
              pageInfo,
            },
          }),
        );
      } else {
        dispatch(
          getChartWidgetDataAsync({
            boardId,
            widgetId,
            renderMode,
            option: {
              pageInfo,
            },
          }),
        );
      }
    },
    [boardId, dispatch, editing, renderMode, widgetId],
  );
  const onWidgetAction = useCallback(
    (action: widgetActionType, widget: Widget) => {
      switch (action) {
        case 'fullScreen':
          onWidgetFullScreen(editing, boardId, widgetId);
          break;
        case 'info':
          break;
        case 'refresh':
          onWidgetGetData(boardId, widgetId);
          break;
        case 'delete':
          onWidgetDelete(widget.config.type, widgetId);
          break;
        case 'edit':
          onWidgetEdit(widget, widgetId);
          break;
        case 'makeLinkage':
          onMakeLinkage(widgetId);
          break;
        case 'makeJump':
          onMakeJump(widgetId);
          break;
        case 'closeJump':
          dispatch(closeJumpAction(widget));
          break;
        case 'closeLinkage':
          dispatch(closeLinkageAction(widget));
          break;
        default:
          break;
      }
    },
    [
      onWidgetFullScreen,
      editing,
      boardId,
      widgetId,
      onWidgetGetData,
      onWidgetDelete,
      onWidgetEdit,
      onMakeLinkage,
      onMakeJump,
      dispatch,
    ],
  );

  const widgetChartClick = useCallback(
    (widget: Widget, params: ChartMouseEventParams) => {
      // table 分页
      if (params?.seriesType === 'table' && params?.seriesName === 'paging') {
        // table 分页逻辑
        getTableChartData({ widget, params });
        return;
      }
      // jump
      const jumpConfig = widget.config?.jumpConfig;
      if (jumpConfig && jumpConfig.open) {
        clickJump({ widget, params });
        return;
      }
      // linkage
      const linkageConfig = widget.config.linkageConfig;
      if (linkageConfig?.open) {
        toLinkingWidgets(widget, params);
        return;
      }
    },
    [clickJump, getTableChartData, toLinkingWidgets],
  );
  const Methods: WidgetMethodContextProps = {
    onWidgetAction: onWidgetAction,
    widgetChartClick: widgetChartClick,
    onClearLinkage: onClearLinkage,
  };

  return (
    <WidgetMethodContext.Provider value={Methods}>
      {children}
    </WidgetMethodContext.Provider>
  );
};
