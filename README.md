# WuWa-Config
This repository includes all custom-built configurations in improving your Android's Wuthering Waves experience.

# How to Modify Config Files
Hello, Arglax here. This will be my text-based tutorial in configuring WuWa for mobile.

Requirements: 
1. Windows PC/Laptop
2. Cable adapter
3. Your mobile device

==========Setting Up==============

1. Connect your mobile device to your PC/Laptop.
2. Make sure to select Android File Transfer/Android Auto as connection.
	- most of the time, the default usb connection is "Charge Only"
3. Open File Explorer in your PC
	- If your mobile connection pops up, choose the one with File Explorer
4. On your PC, navigate to your mobile phone.
Select these in order:
1. Internal Storage
2. Android
3. Data
4. com.kurogame.wutheringwaves.global
5. Files
6. (Optional) Paste the VulkanProgramBinaryCache Folder here
7. UE4Game
8. Client
9. Client
10. Saved
11. Config
12. Android

Then, paste the Engine.ini and DeviceProfiles.ini here. Feel free to overwrite/Copy and Replace.

Now open your WuWa and congrats you're done!
================================
FAQs:
Q: Is there a way that will not require a PC to modify the config files?

A: Yes but that is out of my scope. You can research about it or try this repos: https://github.com/AlteriaX/WuWa-Configs/blob/main/README.md

Q: My WuWa just keeps on crashing

A: Do not use my config. Delete the DeviceProfiles.ini and Engine.ini from your Android Folder and then restart the game.

Q: Game FPS is low/ Experiencing stuttering

A: Go to Engine.ini and modify everything with "DensityScale". Change values to 1. You can also change all resolution scale factor to a lower value like 0.85


For more questions, just chat me in Discord: https://discord.gg/4DYe8srs
