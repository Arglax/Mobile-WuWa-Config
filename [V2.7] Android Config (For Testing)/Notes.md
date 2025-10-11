This config is for android (and hopefully iOS) for WuWa Game Version 2.7

This has been tested for Poco X6 Pro (Mediatek 8300 Ultra) and provides good graphics quality and smooth performance.
- Vulkan is forced in this config via Engine.ini

*This is being further tested by people who joined the discord channel.

Possible bugs/issues:
1. Black graphics occurence when app is not focused.
- such as when you have a floating windows for another app or using native screenshot
2. Heating is a bit expected, however, no case of overheating (40C above) for now
3. Black screen flickering/blinking during game loading screens.
  - I personally don't know yet the cause of this, but so far in-game there are no flickers/blinks

==============================  
Before you proceed with the troubleshooting, please make sure you have read the Standard Testing Protocols.md  

[Troubleshooting]
If your device is crashing with these configs, here's how to troubleshoot it:  
1. Disable forcing of Vulkan
   - Read the notes in your DeviceProfiles and/or Engine.ini on which line of code to modify  
1.a. Disable frame generation
   - Set r.AFME.Enable = 0 in your Engine.ini  
2. Edit your DeviceProfiles.ini
   - Read the notes in the DeviceProfiles.ini on which to change
   - Alternatively, switch from "Android_VeryHigh to "Android" DeviceProfile
3. Delete the DeviceProfiles.ini and just run the game with Engine.ini
4. Use a different config from the Community Configs or Old Configs in this repository.
5. Join the discord server and leave a message in the issues or config help channel.
6. If all else fails, stop using config files.



