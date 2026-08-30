import unittest

try:
    from app import create_app
    HAS_FLASK = True
except ImportError:
    HAS_FLASK = False


@unittest.skipUnless(HAS_FLASK, "Flask dependency not installed in local environment")
class TestVirtualCinema(unittest.TestCase):
    def setUp(self):
        self.app = create_app()
        self.app.config.update(TESTING=True)
        self.client = self.app.test_client()

    def test_virtual_cinema_elements_rendered(self):
        response = self.client.get("/")
        self.assertEqual(response.status_code, 200)
        html = response.get_data(as_text=True)

        self.assertIn("4DX Cinema", html)
        self.assertIn("cinemaMovieCanvas", html)
        self.assertIn("virtualTheaterHub", html)
        self.assertIn("Private Family", html)
        self.assertIn("auditoriumSeatsRow", html)
        self.assertIn("chatMessagesBox", html)
        self.assertIn("reaction-emoji-btn", html)

    def test_4dx_sensory_triggers_and_hud_present(self):
        response = self.client.get("/")
        html = response.get_data(as_text=True)

        self.assertIn("triggerSeatRumbleBtn", html)
        self.assertIn("triggerAirBlastBtn", html)
        self.assertIn("triggerStrobeBtn", html)
        self.assertIn("triggerFogBtn", html)
        self.assertIn("hud4dxMotion", html)
        self.assertIn("hud4dxWind", html)
        self.assertIn("theaterStrobeOverlay", html)
        self.assertIn("screenFogOverlay", html)

    def test_spatial_audio_and_dim_lights_controls_present(self):
        response = self.client.get("/")
        html = response.get_data(as_text=True)

        self.assertIn("dimLightsBtn", html)
        self.assertIn("spatialAudioBtn", html)


if __name__ == "__main__":
    unittest.main()
