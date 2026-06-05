I'll format this properly in the following update.  

Here's what you need to know related to the Z_Experimental Config:  
1. Personally tested **ONLY** on Poco X6 Pro. Therefore create an issue or let me know through Discord if you encounter problems.  
2. There was a weird lighting last time which exposed rectangular textures with fixed light, as well as a lod distance issue that will make a character pass through terrains/appear submerged. This is now fixed, especially in the Lahai-Roi snowy region.  

# Based on recent findings through testing, KuroFI will NOT work if you have either AFME or MFRC frame generation ON. To use KuroFI, make sure to comment any MFRC or AFME cvar.

## Notable CVars:  

1. r.KuroFI.Enable
    > 0 is disable, 1 is enable  
    > Extremely bad based on my test on Dimensity 8300, might produce better results for higher-end device or maybe low-end device  
    > This is Kuro's frame generation

Some extremely helpful cvars like r.MobileContentScaleFactor and r.SecondaryScreenPercentage.GameViewPort got included in the forbidden cvars, therefore they are excluded in the config or commented. If they are still in your configs, they will not work.  

To force custom resolution for your wuwa, you need to do phone-specific overrides that can be found on your phone's settings or developer options, this is not included in the configs therefore will not be run through here