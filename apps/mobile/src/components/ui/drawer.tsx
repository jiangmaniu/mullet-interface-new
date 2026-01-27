import React from 'react';
import { Modal, View, TouchableWithoutFeedback, ModalProps } from 'react-native';
import Animated, { SlideInDown, Easing, SlideOutDown, FadeIn, FadeOut } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path, SvgProps } from "react-native-svg";
import { cn } from '@/lib/utils';
import { Button } from './button';
import { Text } from './text';

export interface DrawerProps extends ModalProps {
    visible: boolean;
    onClose: () => void;
    children: React.ReactNode;
    overlayClassName?: string;
}

export function Drawer({
    visible,
    onClose,
    children,
    overlayClassName,
    ...props
}: DrawerProps) {
    const insets = useSafeAreaInsets();
    const [showModal, setShowModal] = React.useState(visible);

    React.useEffect(() => {
        if (visible) {
            setShowModal(true);
        } else {
            const timer = setTimeout(() => setShowModal(false), 500);
            return () => clearTimeout(timer);
        }
    }, [visible]);

    if (!showModal) return null;

    return (
        <Modal
            transparent
            visible={true}
            animationType='none'
            onRequestClose={onClose}
            {...props}
        >
            <View className={cn("flex-1 justify-end", overlayClassName)}>
                {visible && (
                    <Animated.View 
                        entering={FadeIn}
                        exiting={FadeOut.duration(400)}
                        className="absolute inset-0 bg-card"
                    >
                        <TouchableWithoutFeedback onPress={onClose}>
                            <View className="flex-1" />
                        </TouchableWithoutFeedback>
                    </Animated.View>
                )}

                {visible && (
                    <Animated.View
                        entering={SlideInDown.duration(400).easing(Easing.out(Easing.cubic))}
                        exiting={SlideOutDown.duration(400).easing(Easing.out(Easing.cubic))}
                        className={cn("bg-special rounded-t-large overflow-hidden w-full")}
                        style={{ paddingBottom: insets.bottom }}
                    >
                        {children}
                    </Animated.View>
                )}
            </View>
        </Modal>
    );
}

const IconClose = ({ className, ...props }: SvgProps & { className?: string }) => (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" className={className} {...props}>
        <Path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
);

export interface DrawerHeaderProps {
    icon?: React.ReactNode;
    title?: React.ReactNode;
    onClose?: () => void;
	closeButton?: React.ReactNode;
    className?: string;
    children?: React.ReactNode;
}
