'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = Component({
  behaviors: [],
  properties: {
    maskOptions: {
      type: Object,
      value: {}
    },
    locked: {
      type: String,
      value: "hide"
    },
    animationMode: {
      type: String,
      value: 'none'
    },
    align: {
      type: String,
      value: 'center'
    },
    status: {
      type: String,
      value: 'hide',
      observer: function observer(status) {
        if (status === 'show' || status === 'hide') {
          this.setData({
            maskStatus: status
          });
        }
        if (status === 'show') {
          if (!getApp().globalData) {
            Object.assign(getApp(), { globalData: {} });
          }
          var globalData = getApp().globalData;
          var zIndex = (globalData._zIndex || 1000) + 1;
          globalData._zIndex = zIndex;
          this.setData({
            zIndex: zIndex
          });
        }
      }
    }
  },
  data: {
    maskStatus: 'hide',
    zIndex: 1000
  },
  methods: {
    toggle: function toggle(mode) {
      var status = this.data.status;
      if (typeof mode !== 'boolean') {
        mode = status !== 'show';
      }
      if (mode) {
        this.show();
      } else {
        this.hide();
      }
    },
    showMask: function showMask() {
      this.setData({
        maskStatus: 'show'
      });
    },
    hideMask: function hideMask() {
      this.setData({
        maskStatus: 'hide'
      });
    },
    show: function show() {
      var _this = this;

      if (this.data.animationMode !== 'none') {
        this.showMask();
        this.setData({
          status: 'fadeIn'
        });

        setTimeout(function () {
          _this.setData({
            status: 'show'
          });
        }, 50);
      } else {
        this.showMask();
        this.setData({
          status: 'show'
        });
      }
    },
    forceHide: function forceHide() {
      this.setData({
        status: 'hide'
      });
      this.hideMask();
    },
    popupTap: function popupTap() {
      if (this.data.locked !== 'true') {
        this.hide();

        this.triggerEvent('popuptap', {}, {});
      }
    },
    hide: function hide() {
      var _this2 = this;

      if (this.data.animationMode !== 'none') {
        this.setData({
          status: 'fadeOut'
        });

        clearTimeout(this._timer);

        this._timer = setTimeout(function () {
          _this2.forceHide();
        }, 300);
      } else {
        // ????????????
        this.forceHide();
      }
    },
    onContentTap: function onContentTap() {}
  }
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImluZGV4Lnd4YyJdLCJuYW1lcyI6WyJiZWhhdmlvcnMiLCJwcm9wZXJ0aWVzIiwibWFza09wdGlvbnMiLCJ0eXBlIiwiT2JqZWN0IiwidmFsdWUiLCJsb2NrZWQiLCJTdHJpbmciLCJhbmltYXRpb25Nb2RlIiwiYWxpZ24iLCJzdGF0dXMiLCJvYnNlcnZlciIsInNldERhdGEiLCJtYXNrU3RhdHVzIiwiZ2V0QXBwIiwiZ2xvYmFsRGF0YSIsImFzc2lnbiIsInpJbmRleCIsIl96SW5kZXgiLCJkYXRhIiwibWV0aG9kcyIsInRvZ2dsZSIsIm1vZGUiLCJzaG93IiwiaGlkZSIsInNob3dNYXNrIiwiaGlkZU1hc2siLCJzZXRUaW1lb3V0IiwiZm9yY2VIaWRlIiwicG9wdXBUYXAiLCJ0cmlnZ2VyRXZlbnQiLCJjbGVhclRpbWVvdXQiLCJfdGltZXIiLCJvbkNvbnRlbnRUYXAiXSwibWFwcGluZ3MiOiI7Ozs7OztBQU1FQSxhQUFXLEU7QUFDWEMsY0FBWTtBQUNWQyxpQkFBYTtBQUNYQyxZQUFNQyxNQURLO0FBRVhDLGFBQU87QUFGSSxLQURIO0FBS1ZDLFlBQVE7QUFDTkgsWUFBTUksTUFEQTtBQUVORixhQUFPO0FBRkQsS0FMRTtBQVNWRyxtQkFBZTtBQUNiTCxZQUFNSSxNQURPO0FBRWJGLGFBQU87QUFGTSxLQVRMO0FBYVZJLFdBQU87QUFDTE4sWUFBTUksTUFERDtBQUVMRixhQUFPO0FBRkYsS0FiRztBQWlCVkssWUFBUTtBQUNOUCxZQUFNSSxNQURBO0FBRU5GLGFBQU8sTUFGRDtBQUdOTSxjQUhNLG9CQUdHRCxNQUhILEVBR1c7QUFDZixZQUFJQSxXQUFXLE1BQVgsSUFBcUJBLFdBQVcsTUFBcEMsRUFBNEM7QUFDMUMsZUFBS0UsT0FBTCxDQUFhO0FBQ1hDLHdCQUFZSDtBQURELFdBQWI7QUFHRDtBQUNELFlBQUlBLFdBQVcsTUFBZixFQUF1QjtBQUNyQixjQUFJLENBQUNJLFNBQVNDLFVBQWQsRUFBMEI7QUFDeEJYLG1CQUFPWSxNQUFQLENBQWNGLFFBQWQsRUFBd0IsRUFBQ0MsWUFBWSxFQUFiLEVBQXhCO0FBQ0Q7QUFDRCxjQUFJQSxhQUFhRCxTQUFTQyxVQUExQjtBQUNBLGNBQUlFLFNBQVMsQ0FBQ0YsV0FBV0csT0FBWCxJQUFzQixJQUF2QixJQUErQixDQUE1QztBQUNBSCxxQkFBV0csT0FBWCxHQUFxQkQsTUFBckI7QUFDQSxlQUFLTCxPQUFMLENBQWE7QUFDWEssb0JBQVFBO0FBREcsV0FBYjtBQUdEO0FBQ0Y7QUFwQks7QUFqQkUsRztBQXdDWkUsUUFBTTtBQUNKTixnQkFBWSxNQURSO0FBRUpJLFlBQVE7QUFGSixHO0FBSU5HLFdBQVM7QUFDUEMsVUFETyxrQkFDQUMsSUFEQSxFQUNNO0FBQ1gsVUFBSVosU0FBUyxLQUFLUyxJQUFMLENBQVVULE1BQXZCO0FBQ0EsVUFBSSxPQUFPWSxJQUFQLEtBQWdCLFNBQXBCLEVBQStCO0FBQzdCQSxlQUFPWixXQUFXLE1BQWxCO0FBQ0Q7QUFDRCxVQUFJWSxJQUFKLEVBQVU7QUFDTixhQUFLQyxJQUFMO0FBQ0gsT0FGRCxNQUVPO0FBQ0gsYUFBS0MsSUFBTDtBQUNIO0FBQ0YsS0FYTTtBQVlQQyxZQVpPLHNCQVlJO0FBQ1QsV0FBS2IsT0FBTCxDQUFhO0FBQ1hDLG9CQUFZO0FBREQsT0FBYjtBQUdELEtBaEJNO0FBaUJQYSxZQWpCTyxzQkFpQkk7QUFDVCxXQUFLZCxPQUFMLENBQWE7QUFDWEMsb0JBQVk7QUFERCxPQUFiO0FBR0QsS0FyQk07QUFzQlBVLFFBdEJPLGtCQXNCQTtBQUFBOztBQUVMLFVBQUksS0FBS0osSUFBTCxDQUFVWCxhQUFWLEtBQTRCLE1BQWhDLEVBQXdDO0FBQ3RDLGFBQUtpQixRQUFMO0FBQ0EsYUFBS2IsT0FBTCxDQUFhO0FBQ1hGLGtCQUFRO0FBREcsU0FBYjs7QUFJQWlCLG1CQUFXLFlBQU07QUFDZixnQkFBS2YsT0FBTCxDQUFhO0FBQ1hGLG9CQUFRO0FBREcsV0FBYjtBQUdELFNBSkQsRUFJRyxFQUpIO0FBS0QsT0FYRCxNQVdPO0FBQ0wsYUFBS2UsUUFBTDtBQUNBLGFBQUtiLE9BQUwsQ0FBYTtBQUNYRixrQkFBUTtBQURHLFNBQWI7QUFHRDtBQUNGLEtBekNNO0FBMENQa0IsYUExQ08sdUJBMENLO0FBQ1YsV0FBS2hCLE9BQUwsQ0FBYTtBQUNYRixnQkFBUTtBQURHLE9BQWI7QUFHQSxXQUFLZ0IsUUFBTDtBQUNELEtBL0NNO0FBZ0RQRyxZQWhETyxzQkFnREk7QUFDVCxVQUFJLEtBQUtWLElBQUwsQ0FBVWIsTUFBVixLQUFxQixNQUF6QixFQUFpQztBQUMvQixhQUFLa0IsSUFBTDs7QUFFQSxhQUFLTSxZQUFMLENBQWtCLFVBQWxCLEVBQThCLEVBQTlCLEVBQWtDLEVBQWxDO0FBQ0Q7QUFDRixLQXRETTtBQXVEUE4sUUF2RE8sa0JBdURBO0FBQUE7O0FBRUwsVUFBSSxLQUFLTCxJQUFMLENBQVVYLGFBQVYsS0FBNEIsTUFBaEMsRUFBd0M7QUFDdEMsYUFBS0ksT0FBTCxDQUFhO0FBQ1hGLGtCQUFRO0FBREcsU0FBYjs7QUFJQXFCLHFCQUFhLEtBQUtDLE1BQWxCOztBQUVBLGFBQUtBLE1BQUwsR0FBY0wsV0FBVyxZQUFNO0FBQzdCLGlCQUFLQyxTQUFMO0FBQ0QsU0FGYSxFQUVYLEdBRlcsQ0FBZDtBQUlELE9BWEQsTUFXTztBQUNMO0FBQ0EsYUFBS0EsU0FBTDtBQUNEO0FBQ0YsS0F4RU07QUF5RVBLLGdCQXpFTywwQkF5RVEsQ0FBRTtBQXpFViIsImZpbGUiOiJpbmRleC53eGMiLCJzb3VyY2VzQ29udGVudCI6WyJleHBvcnQgZGVmYXVsdCB7XG4gIGNvbmZpZzoge1xuICAgIHVzaW5nQ29tcG9uZW50czoge1xuICAgICAgJ3d4Yy1tYXNrJzogJ0BtaW51aS93eGMtbWFzaydcbiAgICB9XG4gIH0sXG4gIGJlaGF2aW9yczogW10sXG4gIHByb3BlcnRpZXM6IHtcbiAgICBtYXNrT3B0aW9uczoge1xuICAgICAgdHlwZTogT2JqZWN0LFxuICAgICAgdmFsdWU6IHt9XG4gICAgfSxcbiAgICBsb2NrZWQ6IHtcbiAgICAgIHR5cGU6IFN0cmluZyxcbiAgICAgIHZhbHVlOiBcImhpZGVcIlxuICAgIH0sXG4gICAgYW5pbWF0aW9uTW9kZToge1xuICAgICAgdHlwZTogU3RyaW5nLFxuICAgICAgdmFsdWU6ICdub25lJ1xuICAgIH0sXG4gICAgYWxpZ246IHtcbiAgICAgIHR5cGU6IFN0cmluZyxcbiAgICAgIHZhbHVlOiAnY2VudGVyJ1xuICAgIH0sXG4gICAgc3RhdHVzOiB7XG4gICAgICB0eXBlOiBTdHJpbmcsXG4gICAgICB2YWx1ZTogJ2hpZGUnLFxuICAgICAgb2JzZXJ2ZXIoc3RhdHVzKSB7XG4gICAgICAgIGlmIChzdGF0dXMgPT09ICdzaG93JyB8fCBzdGF0dXMgPT09ICdoaWRlJykge1xuICAgICAgICAgIHRoaXMuc2V0RGF0YSh7XG4gICAgICAgICAgICBtYXNrU3RhdHVzOiBzdGF0dXNcbiAgICAgICAgICB9KVxuICAgICAgICB9XG4gICAgICAgIGlmIChzdGF0dXMgPT09ICdzaG93Jykge1xuICAgICAgICAgIGlmICghZ2V0QXBwKCkuZ2xvYmFsRGF0YSkge1xuICAgICAgICAgICAgT2JqZWN0LmFzc2lnbihnZXRBcHAoKSwge2dsb2JhbERhdGE6IHt9fSlcbiAgICAgICAgICB9XG4gICAgICAgICAgbGV0IGdsb2JhbERhdGEgPSBnZXRBcHAoKS5nbG9iYWxEYXRhXG4gICAgICAgICAgbGV0IHpJbmRleCA9IChnbG9iYWxEYXRhLl96SW5kZXggfHwgMTAwMCkgKyAxXG4gICAgICAgICAgZ2xvYmFsRGF0YS5fekluZGV4ID0gekluZGV4XG4gICAgICAgICAgdGhpcy5zZXREYXRhKHtcbiAgICAgICAgICAgIHpJbmRleDogekluZGV4XG4gICAgICAgICAgfSlcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfSxcbiAgZGF0YToge1xuICAgIG1hc2tTdGF0dXM6ICdoaWRlJyxcbiAgICB6SW5kZXg6IDEwMDBcbiAgfSxcbiAgbWV0aG9kczoge1xuICAgIHRvZ2dsZShtb2RlKSB7XG4gICAgICBsZXQgc3RhdHVzID0gdGhpcy5kYXRhLnN0YXR1c1xuICAgICAgaWYgKHR5cGVvZiBtb2RlICE9PSAnYm9vbGVhbicpIHtcbiAgICAgICAgbW9kZSA9IHN0YXR1cyAhPT0gJ3Nob3cnXG4gICAgICB9XG4gICAgICBpZiAobW9kZSkge1xuICAgICAgICAgIHRoaXMuc2hvdygpXG4gICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRoaXMuaGlkZSgpXG4gICAgICB9XG4gICAgfSxcbiAgICBzaG93TWFzaygpIHtcbiAgICAgIHRoaXMuc2V0RGF0YSh7XG4gICAgICAgIG1hc2tTdGF0dXM6ICdzaG93J1xuICAgICAgfSk7XG4gICAgfSxcbiAgICBoaWRlTWFzaygpIHtcbiAgICAgIHRoaXMuc2V0RGF0YSh7XG4gICAgICAgIG1hc2tTdGF0dXM6ICdoaWRlJ1xuICAgICAgfSk7XG4gICAgfSxcbiAgICBzaG93KCkge1xuXG4gICAgICBpZiAodGhpcy5kYXRhLmFuaW1hdGlvbk1vZGUgIT09ICdub25lJykge1xuICAgICAgICB0aGlzLnNob3dNYXNrKCk7XG4gICAgICAgIHRoaXMuc2V0RGF0YSh7XG4gICAgICAgICAgc3RhdHVzOiAnZmFkZUluJ1xuICAgICAgICB9KTtcblxuICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICB0aGlzLnNldERhdGEoe1xuICAgICAgICAgICAgc3RhdHVzOiAnc2hvdydcbiAgICAgICAgICB9KTtcbiAgICAgICAgfSwgNTApXG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLnNob3dNYXNrKCk7XG4gICAgICAgIHRoaXMuc2V0RGF0YSh7XG4gICAgICAgICAgc3RhdHVzOiAnc2hvdydcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfSxcbiAgICBmb3JjZUhpZGUoKSB7XG4gICAgICB0aGlzLnNldERhdGEoe1xuICAgICAgICBzdGF0dXM6ICdoaWRlJ1xuICAgICAgfSk7XG4gICAgICB0aGlzLmhpZGVNYXNrKCk7XG4gICAgfSxcbiAgICBwb3B1cFRhcCgpIHtcbiAgICAgIGlmICh0aGlzLmRhdGEubG9ja2VkICE9PSAndHJ1ZScpIHtcbiAgICAgICAgdGhpcy5oaWRlKCk7XG5cbiAgICAgICAgdGhpcy50cmlnZ2VyRXZlbnQoJ3BvcHVwdGFwJywge30sIHt9KTtcbiAgICAgIH1cbiAgICB9LFxuICAgIGhpZGUoKSB7XG5cbiAgICAgIGlmICh0aGlzLmRhdGEuYW5pbWF0aW9uTW9kZSAhPT0gJ25vbmUnKSB7XG4gICAgICAgIHRoaXMuc2V0RGF0YSh7XG4gICAgICAgICAgc3RhdHVzOiAnZmFkZU91dCdcbiAgICAgICAgfSk7XG5cbiAgICAgICAgY2xlYXJUaW1lb3V0KHRoaXMuX3RpbWVyKTtcblxuICAgICAgICB0aGlzLl90aW1lciA9IHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgIHRoaXMuZm9yY2VIaWRlKCk7XG4gICAgICAgIH0sIDMwMClcblxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8g5rKh5pyJ5Yqo55S7XG4gICAgICAgIHRoaXMuZm9yY2VIaWRlKCk7XG4gICAgICB9XG4gICAgfSxcbiAgICBvbkNvbnRlbnRUYXAoKSB7fVxuICB9XG59Il19