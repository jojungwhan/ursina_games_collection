# -*- coding: utf-8 -*-
"""
leaflet_python.py - Python wrapper for Leaflet.js maps

Students can create interactive maps using familiar Python syntax!
This module wraps Leaflet.js functionality through Pyodide's JS interop.

Example:
    from leaflet_python import Map, Marker, Circle, Polygon

    # Create a map
    m = Map(center=[37.5665, 126.9780], zoom=10)

    # Add a marker
    m.add_marker([37.5665, 126.9780], popup="서울!")

    # Show the map
    m.show()
"""

# Check if running in Pyodide (browser)
try:
    from js import L, document, window
    from pyodide.ffi import to_js
    IN_BROWSER = True
except ImportError:
    IN_BROWSER = False
    # Dummy to_js for non-browser environments
    def to_js(x, **kwargs):
        return x
    print("⚠️ 이 모듈은 브라우저에서만 작동합니다!")


class Map:
    """
    지도 클래스 - Leaflet 지도를 Python으로 만들어요!

    Parameters:
        center (list): [위도, 경도] - 지도 중심 좌표
        zoom (int): 확대 레벨 (1-18, 기본값: 10)
        container_id (str): 지도를 표시할 HTML 요소 ID

    Example:
        m = Map(center=[37.5665, 126.9780], zoom=12)
        m.show()
    """

    # Class variable to track current map instance
    _current_map = None
    _container_id = None

    def __init__(self, center=[37.5665, 126.9780], zoom=10, container_id=None):
        """지도를 초기화해요."""
        self.center = center
        self.zoom = zoom
        self._markers = []
        self._circles = []
        self._polygons = []
        self._polylines = []
        self._geojson_layers = []
        self._map = None

        # Find container ID
        if container_id:
            self._container_id = container_id
        else:
            # Try to find from global context or use default
            self._container_id = self._find_container_id()

        Map._container_id = self._container_id

    def _find_container_id(self):
        """Find the map container ID from the page context."""
        if not IN_BROWSER:
            return 'map'

        # Check class variable first (set by integration.js before running code)
        if Map._container_id and Map._container_id != 'map':
            return str(Map._container_id)

        # Check if there's a global container ID set in window
        try:
            container = window._currentMapContainer
            if container:
                return str(container)
        except (AttributeError, Exception):
            pass

        # Look for map-container class
        try:
            containers = document.querySelectorAll('.map-container')
            if containers.length > 0:
                container = containers[0]
                if container.id:
                    return str(container.id)
        except:
            pass

        return 'map'

    def _cleanup_existing(self):
        """Clean up any existing map on the container."""
        if not IN_BROWSER:
            return

        from js import eval as js_eval
        # Ensure container_id is a plain Python string
        container_id = str(self._container_id) if self._container_id else 'map'

        # First, try to remove existing map instance from global storage
        try:
            existing = js_eval(f'window._mapInstances && window._mapInstances["{container_id}"]')
            if existing:
                try:
                    existing.remove()
                except:
                    pass
                js_eval(f'delete window._mapInstances["{container_id}"]')
        except:
            pass

        # CRITICAL: Remove Leaflet's internal _leaflet_id property from the container
        # This is what Leaflet checks to see if a container is already initialized
        try:
            js_eval(f'''
                (function() {{
                    var el = document.getElementById("{container_id}");
                    if (el) {{
                        delete el._leaflet_id;
                        el._leaflet_id = undefined;
                        el.innerHTML = "";
                        el.className = el.className.replace(/leaflet-[\\w-]+/g, "").trim();
                    }}
                }})()
            ''')
        except Exception as e:
            print(f"Cleanup error: {e}")

    def show(self):
        """
        지도를 화면에 표시해요!

        Example:
            m = Map(center=[37.5665, 126.9780])
            m.show()  # 지도가 나타납니다!
        """
        if not IN_BROWSER:
            print("⚠️ 브라우저에서 실행해주세요!")
            return self

        # Ensure container_id is a plain Python string
        container_id = str(self._container_id) if self._container_id else 'map'

        # Cleanup existing map
        self._cleanup_existing()

        # Create the map (convert Python list to JS array)
        self._map = L.map(container_id).setView(
            to_js(self.center), self.zoom
        )

        # Add tile layer (OpenStreetMap)
        from js import Object
        tile_options = Object.new()
        tile_options.attribution = '© OpenStreetMap contributors'
        L.tileLayer(
            'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
            tile_options
        ).addTo(self._map)

        # Store globally for cleanup
        # Note: We store via a temporary variable to avoid JsProxy assignment issues
        from js import eval as js_eval
        window._tempMap = self._map
        js_eval(f'''
            window._mapInstances = window._mapInstances || {{}};
            window._mapInstances["{container_id}"] = window._tempMap;
            delete window._tempMap;
        ''')

        # Add all markers
        for marker_data in self._markers:
            self._add_marker_to_map(marker_data)

        # Add all circles
        for circle_data in self._circles:
            self._add_circle_to_map(circle_data)

        # Add all polygons
        for poly_data in self._polygons:
            self._add_polygon_to_map(poly_data)

        # Add all polylines
        for line_data in self._polylines:
            self._add_polyline_to_map(line_data)

        # Add all GeoJSON layers
        for geojson_data in self._geojson_layers:
            self._add_geojson_to_map(geojson_data)

        Map._current_map = self._map

        return self

    def add_marker(self, position, popup=None, tooltip=None, icon=None, color='blue'):
        """
        마커(핀)를 추가해요!

        Parameters:
            position (list): [위도, 경도]
            popup (str): 클릭하면 나오는 말풍선 내용
            tooltip (str): 마우스 올리면 나오는 툴팁
            color (str): 마커 색상 ('blue', 'red', 'green', 'orange', 'purple')

        Example:
            m.add_marker([37.5665, 126.9780], popup="서울시청")
        """
        self._markers.append({
            'position': position,
            'popup': popup,
            'tooltip': tooltip,
            'icon': icon,
            'color': color
        })

        # If map already shown, add immediately
        if self._map:
            self._add_marker_to_map(self._markers[-1])

        return self

    def _add_marker_to_map(self, marker_data):
        """Internal: Add marker to the Leaflet map."""
        if not IN_BROWSER or not self._map:
            return

        options = {}

        # Create marker (convert Python list to JS array)
        marker = L.marker(to_js(marker_data['position']), options)

        if marker_data['popup']:
            marker.bindPopup(str(marker_data['popup']))

        if marker_data['tooltip']:
            marker.bindTooltip(str(marker_data['tooltip']))

        marker.addTo(self._map)

    def add_circle(self, center, radius=500, color='blue', fill=True,
                   fill_opacity=0.3, popup=None):
        """
        원을 추가해요!

        Parameters:
            center (list): [위도, 경도] - 원의 중심
            radius (int): 반지름 (미터 단위)
            color (str): 테두리 색상
            fill (bool): 내부를 채울지 여부
            fill_opacity (float): 내부 투명도 (0-1)
            popup (str): 클릭하면 나오는 말풍선

        Example:
            m.add_circle([37.5665, 126.9780], radius=1000, color='red')
        """
        self._circles.append({
            'center': center,
            'radius': radius,
            'color': color,
            'fill': fill,
            'fill_opacity': fill_opacity,
            'popup': popup
        })

        if self._map:
            self._add_circle_to_map(self._circles[-1])

        return self

    def _add_circle_to_map(self, circle_data):
        """Internal: Add circle to the Leaflet map."""
        if not IN_BROWSER or not self._map:
            return

        from js import Object
        options = Object.new()
        options.radius = float(circle_data['radius'])
        options.color = str(circle_data['color'])
        options.fillColor = str(circle_data['color'])
        options.stroke = True
        options.weight = 2
        # Ensure booleans are properly set
        options.fill = True if circle_data['fill'] else False
        options.fillOpacity = float(circle_data['fill_opacity'])

        circle = L.circle(to_js(circle_data['center']), options)

        if circle_data['popup']:
            circle.bindPopup(str(circle_data['popup']))

        circle.addTo(self._map)

    def add_polygon(self, positions, color='blue', fill=True,
                    fill_opacity=0.3, popup=None, fill_color=None):
        """
        다각형을 추가해요!

        Parameters:
            positions (list): [[위도, 경도], [위도, 경도], ...] - 꼭짓점 좌표들
            color (str): 테두리 색상
            fill (bool): 내부를 채울지 여부
            fill_opacity (float): 내부 투명도 (0-1)
            popup (str): 클릭하면 나오는 말풍선
            fill_color (str): 내부 채우기 색상 (지정하지 않으면 color와 동일)

        Example:
            m.add_polygon([
                [37.57, 126.97],
                [37.56, 126.99],
                [37.55, 126.97]
            ], color='green')

            # 단계구분도 스타일
            m.add_polygon(coords, color='white', fill_color='#ff0000')
        """
        self._polygons.append({
            'positions': positions,
            'color': color,
            'fill': fill,
            'fill_opacity': fill_opacity,
            'popup': popup,
            'fill_color': fill_color if fill_color else color
        })

        if self._map:
            self._add_polygon_to_map(self._polygons[-1])

        return self

    def _add_polygon_to_map(self, poly_data):
        """Internal: Add polygon to the Leaflet map."""
        if not IN_BROWSER or not self._map:
            return

        from js import Object
        options = Object.new()
        options.color = str(poly_data['color'])
        options.fillColor = str(poly_data.get('fill_color', poly_data['color']))
        options.stroke = True
        options.weight = 2
        options.fill = True if poly_data['fill'] else False
        options.fillOpacity = float(poly_data['fill_opacity'])

        # Convert nested list of positions to JS array
        js_positions = to_js(poly_data['positions'])
        polygon = L.polygon(js_positions, options)

        if poly_data['popup']:
            polygon.bindPopup(str(poly_data['popup']))

        polygon.addTo(self._map)

    def add_line(self, positions, color='blue', weight=3, opacity=1.0, popup=None):
        """
        선(경로)을 추가해요!

        Parameters:
            positions (list): [[위도, 경도], [위도, 경도], ...] - 점들의 좌표
            color (str): 선 색상
            weight (int): 선 두께 (픽셀)
            opacity (float): 투명도 (0-1)
            popup (str): 클릭하면 나오는 말풍선

        Example:
            m.add_line([
                [37.57, 126.97],
                [37.55, 127.00],
                [37.53, 126.98]
            ], color='red', weight=5)
        """
        self._polylines.append({
            'positions': positions,
            'color': color,
            'weight': weight,
            'opacity': opacity,
            'popup': popup
        })

        if self._map:
            self._add_polyline_to_map(self._polylines[-1])

        return self

    def _add_polyline_to_map(self, line_data):
        """Internal: Add polyline to the Leaflet map."""
        if not IN_BROWSER or not self._map:
            return

        from js import Object
        options = Object.new()
        options.color = str(line_data['color'])
        options.weight = int(line_data['weight'])
        options.opacity = float(line_data['opacity'])

        # Convert nested list of positions to JS array
        js_positions = to_js(line_data['positions'])
        polyline = L.polyline(js_positions, options)

        if line_data['popup']:
            polyline.bindPopup(str(line_data['popup']))

        polyline.addTo(self._map)

    def add_geojson(self, data, style=None, popup_field=None):
        """
        GeoJSON 데이터를 추가해요!

        Parameters:
            data (dict): GeoJSON 형식의 데이터
            style (dict): 스타일 옵션 {'color': 'blue', 'weight': 2, ...}
            popup_field (str): 팝업에 표시할 속성 이름

        Example:
            geojson = {
                "type": "Feature",
                "geometry": {
                    "type": "Point",
                    "coordinates": [126.9780, 37.5665]
                },
                "properties": {"name": "서울"}
            }
            m.add_geojson(geojson, popup_field="name")
        """
        self._geojson_layers.append({
            'data': data,
            'style': style or {'color': 'blue', 'weight': 2},
            'popup_field': popup_field
        })

        if self._map:
            self._add_geojson_to_map(self._geojson_layers[-1])

        return self

    def _add_geojson_to_map(self, geojson_data):
        """Internal: Add GeoJSON to the Leaflet map."""
        if not IN_BROWSER or not self._map:
            return

        import json
        from js import JSON, Object

        # Convert Python dict to JS object via JSON serialization
        js_data = JSON.parse(json.dumps(geojson_data['data']))

        # Create style options
        style = geojson_data['style']
        js_style = Object.new()
        for key, value in style.items():
            setattr(js_style, key, value)

        # Create options object
        options = Object.new()
        options.style = js_style

        layer = L.geoJSON(js_data, options)
        layer.addTo(self._map)

    def set_view(self, center, zoom=None):
        """
        지도 위치를 이동해요!

        Parameters:
            center (list): [위도, 경도]
            zoom (int): 확대 레벨 (선택)

        Example:
            m.set_view([35.1796, 129.0756], zoom=12)  # 부산으로 이동
        """
        self.center = center
        if zoom:
            self.zoom = zoom

        if self._map:
            self._map.setView(to_js(center), self.zoom)

        return self

    def fly_to(self, center, zoom=None):
        """
        지도를 부드럽게 이동해요! (애니메이션)

        Parameters:
            center (list): [위도, 경도]
            zoom (int): 확대 레벨 (선택)

        Example:
            m.fly_to([33.4996, 126.5312], zoom=10)  # 제주도로 날아가기!
        """
        self.center = center
        if zoom:
            self.zoom = zoom

        if self._map:
            self._map.flyTo(to_js(center), self.zoom)

        return self


# =============================================================================
# CONVENIENCE FUNCTIONS
# =============================================================================

def create_map(center=[37.5665, 126.9780], zoom=10):
    """
    지도를 쉽게 만드는 함수!

    Example:
        m = create_map([37.5665, 126.9780], zoom=12)
        m.add_marker([37.5665, 126.9780], popup="여기!")
        m.show()
    """
    return Map(center=center, zoom=zoom)


def quick_map(center=[37.5665, 126.9780], zoom=10, markers=None):
    """
    마커와 함께 지도를 빠르게 만들어요!

    Parameters:
        center: 지도 중심 [위도, 경도]
        zoom: 확대 레벨
        markers: 마커 리스트 [{'position': [lat, lng], 'popup': '텍스트'}, ...]

    Example:
        quick_map(
            center=[37.5665, 126.9780],
            markers=[
                {'position': [37.5665, 126.9780], 'popup': '서울'},
                {'position': [35.1796, 129.0756], 'popup': '부산'}
            ]
        )
    """
    m = Map(center=center, zoom=zoom)

    if markers:
        for marker in markers:
            m.add_marker(
                marker.get('position', center),
                popup=marker.get('popup'),
                tooltip=marker.get('tooltip')
            )

    return m.show()


# =============================================================================
# KOREAN CITY COORDINATES (편의 상수)
# =============================================================================

# 주요 도시 좌표
CITIES = {
    '서울': [37.5665, 126.9780],
    '부산': [35.1796, 129.0756],
    '인천': [37.4563, 126.7052],
    '대구': [35.8714, 128.6014],
    '대전': [36.3504, 127.3845],
    '광주': [35.1595, 126.8526],
    '울산': [35.5384, 129.3114],
    '세종': [36.4800, 127.2890],
    '제주': [33.4996, 126.5312],
    '수원': [37.2636, 127.0286],
    '창원': [35.2281, 128.6812],
    '전주': [35.8242, 127.1480],
    '청주': [36.6424, 127.4890],
    '포항': [36.0190, 129.3435],
    '평택': [36.9921, 127.1127],
}

def get_city_coords(city_name):
    """
    도시 이름으로 좌표를 가져와요!

    Example:
        coords = get_city_coords('서울')  # [37.5665, 126.9780]
        m = Map(center=coords, zoom=12)
    """
    return CITIES.get(city_name, CITIES['서울'])


# Print help on import
if IN_BROWSER:
    print("🗺️ leaflet_python 모듈이 로드되었습니다!")
    print("   사용법: m = Map(center=[37.5, 127], zoom=10)")
    print("          m.add_marker([37.5, 127], popup='안녕!')")
    print("          m.show()")
