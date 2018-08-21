# coding=utf-8
from appium import webdriver
from selenium.webdriver.common.by import By
import time
import threading

class Wechat():
    '''微信自动化操作助手'''

    def __init__(self, ip, port, name, udid):
        desired_caps = {
            'platformName': 'Android',
            'deviceName': name,
            'udid': udid,
            'platformVersion': "7.0",
            'appPackage': 'com.tencent.mm',
            'appActivity': '.ui.LauncherUI',
            'noReset': True
        }
        print desired_caps
        server = 'http://%s:%s/wd/hub' % (ip, port)
        print server
        self.driver = webdriver.Remote(server, desired_caps)
        self.driver.launch_app()
        self.driver.implicitly_wait(10)

    def parse_biz(self):
        '''
        逐个点进公众号
        '''
        # 点击通讯录Tab
        self.driver.find_elements_by_id('com.tencent.mm:id/cdh')[1].click()
        self.driver.implicitly_wait(2)
        # 选择“公众号”
        self.driver.find_elements_by_id('com.tencent.mm:id/jz')[2].click()
        self.driver.implicitly_wait(2)
        name_list = []
        while True:
            # 公众号列表
            biz_list = self.driver.find_elements_by_id('com.tencent.mm:id/a0y')
            # 逐个点进去
            for e in biz_list:
                name = e.text
                if not name in name_list:
                    print name
                    # 点击公众号
                    e.click()
                    time.sleep(2)
                    # 点击右上角
                    self.driver.find_element_by_accessibility_id('聊天信息').click()
                    time.sleep(2)
                    # 向下滑动，露出“全部消息”
                    self.driver.swipe(929, 1065, 929, 225)
                    time.sleep(2)
                    # 点击全部消息
                    self.driver.find_element_by_id('com.tencent.mm:id/aom').click()
                    time.sleep(5)
                    # 返回
                    self.driver.keyevent(4)
                    time.sleep(2)
                    # 返回
                    self.driver.back()
                    time.sleep(2)
                    # 返回
                    self.driver.back()
                    time.sleep(2)
                    name_list.append(name)
            if self.has_element(By.ID, 'com.tencent.mm:id/z5'): #到底了
                print self.driver.find_element_by_id('com.tencent.mm:id/z5').text
                break
            else:
                self.driver.swipe(700, 1568, 700, 221)
                time.sleep(2)

    def read_article(self):
        '''阅读文章'''
        biz_list = self.driver.find_elements_by_id('com.tencent.mm:id/a0y')
        index = 0
        while True:
            biz_list[index].click()
            time.sleep(2)
            self.driver.swipe(700, 1065, 700, 500)
            time.sleep(2)
            if self.has_element(By.ID, 'com.tencent.mm:id/aqd'):
                self.driver.find_elements_by_id('com.tencent.mm:id/aqd')[0].click()
                time.sleep(5)
                break
            else:
                self.driver.back()
                time.sleep(2)
                index += 1

    def has_element(self, selector, element):
		'''
        判断有无给定的元素

        Args:
            selector: 元素定位方式
            element: 元素的定位属性值

        Returns:
            如果元素存在，则返回True；
            否则返回False
        '''
		try:
			self.driver.find_element(selector, element)
			return True
		except Exception:
			return False
   
    def quit(self):
        '''退出自动化操作'''
        self.driver.quit()


def startRun(ip, port, name, udid):
    app = Wechat(ip, port, name, udid)
    try:
        app.parse_biz()
        app.read_article()
    except Exception:
        raise
    finally:
        app.quit()


if __name__ == '__main__':
    # threads = []
    # t1 = threading.Thread(target=startRun,args=('127.0.0.1','4723','X4-1','82cbaa1b7d24'))
    # threads.append(t1)
    # t2 = threading.Thread(target=startRun,args=('127.0.0.1','4733','X4-2','8361aa507d24'))
    # threads.append(t2)
    # for t in threads:
    # t.setDaemon(True)
    #	t.start()
    startRun('127.0.0.1', '4723', 'C5', '0fade031')