from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import time

import index
from .IntegrationTests import IntegrationTests


class Tests(IntegrationTests):
    def test_review_app(self):
        app = index.app
        self.startServer(app)

        print(self.driver.capabilities["browserName"])
        print(self.driver.capabilities["version"])
        links = [
            a.get_property("href")
            for a in self.driver.find_elements_by_css_selector("a")
        ]

        def visit_and_snapshot(href):
            self.driver.get(href)
            WebDriverWait(self.driver, 10).until(
                EC.presence_of_element_located((By.ID, "waitfor"))
            )
            print("Before: %s" % time.ctime())
            time.sleep(50)
            print("After: %s" % time.ctime())
            self.snapshot(href)
            self.driver.back()

        for link in links:
            visit_and_snapshot(link)
