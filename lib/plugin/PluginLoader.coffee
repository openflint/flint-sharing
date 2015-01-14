#
# Copyright (C) 2013-2014, The OpenFlint Open Source Project
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
# http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS-IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
#

NPAPIPlugin = require './NPAPI/NPAPIPlugin'
FakePlugin = require './FakePlugin'
FfosPlugin = require './Ffos/FfosPlugin'
Platform = require '../common/Platform'

class PluginLoader

    @DEBUG = false

    @plugin = null

    @isReceiver = false

    @getPlugin: ->
        if PluginLoader.DEBUG
            PluginLoader.plugin = new FakePlugin(PluginLoader.isReceiver)

        if not PluginLoader.plugin
            # load order:
            #   browser specical
            #   browser plugin
            #   npapi
            #   common
            platform = Platform.getPlatform()
            console.info 'Platform is : ', platform.browser
            try
                switch platform.browser
                    when 'ffos'
                        PluginLoader.plugin = new FfosPlugin(PluginLoader.isReceiver)
                    when 'firefox', 'chrome', 'safari', 'msie'
                        PluginLoader.plugin = new NPAPIPlugin(PluginLoader.isReceiver)
                    else
                        PluginLoader.plugin = new FakePlugin(PluginLoader.isReceiver)
            catch e
                PluginLoader.plugin = null
                console.error 'catch: ', e

            if not PluginLoader.plugin
                PluginLoader.plugin = new FakePlugin(PluginLoader.isReceiver)

        return PluginLoader.plugin

    @setItAsReceiver: ->
        PluginLoader.isReceiver = true

module.exports = PluginLoader
