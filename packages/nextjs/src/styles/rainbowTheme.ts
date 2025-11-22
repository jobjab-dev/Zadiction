import { lightTheme, Theme } from '@rainbow-me/rainbowkit';

export const sketchTheme = (): Theme => ({
    ...lightTheme({
        accentColor: '#FFD700', // Marker yellow
        accentColorForeground: '#1A1A1A', // Ink black
        borderRadius: 'medium',
        fontStack: 'system',
        overlayBlur: 'small',
    }),
    colors: {
        ...lightTheme().colors,
        modalBackground: '#FDFBF7', // Paper background
        modalBorder: '#1A1A1A', // Ink border
        modalText: '#1A1A1A',
        modalTextSecondary: '#4A4A4A',
        actionButtonBorder: '#1A1A1A',
        actionButtonBorderMobile: '#1A1A1A',
        actionButtonSecondaryBackground: '#FDFBF7',
        closeButton: '#1A1A1A',
        closeButtonBackground: '#FDFBF7',
        connectButtonBackground: '#FDFBF7',
        connectButtonBackgroundError: '#FF4D4D',
        connectButtonInnerBackground: '#FDFBF7',
        connectButtonText: '#1A1A1A',
        connectButtonTextError: '#1A1A1A',
        connectionIndicator: '#30E000',
        downloadBottomCardBackground: '#FDFBF7',
        downloadTopCardBackground: '#FDFBF7',
        error: '#FF4D4D',
        generalBorder: '#1A1A1A',
        generalBorderDim: '#1A1A1A',
        menuItemBackground: '#FDFBF7',
        profileAction: '#FDFBF7',
        profileActionHover: '#F5F2EB',
        profileForeground: '#FDFBF7',
        selectedOptionBorder: '#1A1A1A',
        standby: '#FFD700',
    },
    shadows: {
        ...lightTheme().shadows,
        connectButton: '2px 2px 0px 0px #1A1A1A',
        dialog: '4px 4px 0px 0px #1A1A1A',
        profileDetailsAction: '2px 2px 0px 0px #1A1A1A',
        selectedOption: '2px 2px 0px 0px #1A1A1A',
        selectedWallet: '2px 2px 0px 0px #1A1A1A',
        walletLogo: '2px 2px 0px 0px #1A1A1A',
    },
    radii: {
        ...lightTheme().radii,
        actionButton: '255px 15px 225px 15px / 15px 225px 15px 255px', // Sketch border radius
        connectButton: '255px 15px 225px 15px / 15px 225px 15px 255px',
        menuButton: '255px 15px 225px 15px / 15px 225px 15px 255px',
        modal: '255px 15px 225px 15px / 15px 225px 15px 255px',
        modalMobile: '255px 15px 225px 15px / 15px 225px 15px 255px',
    },
    fonts: {
        body: '"Comic Sans MS", "Chalkboard SE", "Marker Felt", sans-serif',
    },
});
