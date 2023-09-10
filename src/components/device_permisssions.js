import React, { useState, useRef, useEffect } from "react";
import usePermissions from './usePermissions';
import PermissionButton from './PermissionButton';
import {getDeviceType} from "./util";

import {Lock, MicFill, CameraVideoFill, GeoAltFill } from "react-bootstrap-icons";
import {Modal} from "react-bootstrap";

import "../assets/css/permissions.css";

function PermissionModal({ permissionNames , closeModal, onPermissionChanged, setShowAudioPermissionModal}) {
    const [permissions, loading, requestPermission, setPermissions] = usePermissions();
    const [modalIsOpen, setIsOpen] = useState(false);

    const loadingPermissions = Object.values(loading).some(v => v);
    const deniedPermissions = permissionNames.filter(permissionName => permissions[permissionName] === "denied");
    const deniedPermissionsString = deniedPermissions.join(', ');
    const device_type = getDeviceType();

    const permission_messaging = {
        "camera" : {"msg" : "The app requires use of the camera for taking photos of neighborhood features", "icon" : <CameraVideoFill size={40}/> },
        "audio" : {"msg" : "The app requires use of the microphone for recording observations of neighborhood features", "icon" : <MicFill size={40}/> },
        "geo" : {"msg" : "The app requires use of the geolocation data for mapping walks around the neighborhood", "icon" : <GeoAltFill size={40}/> },
    }

    useEffect(() => {
        if (loadingPermissions) return;

        const deniedPermissions         = permissionNames.filter(permissionName => permissions[permissionName] === "denied");
        const isPermissionNotGranted    = deniedPermissions.length > 0 || permissionNames.some(permissionName => permissions[permissionName] !== "granted");

        // Control Modal Open State
        setIsOpen(isPermissionNotGranted);
    }, [permissionNames, permissions, loadingPermissions]);


    // Create a ref
    const onPermissionChangedRef = useRef(null);

    // Sync it with the current onPermissionChanged function prop
    useEffect(() => {
        onPermissionChangedRef.current = onPermissionChanged;
    }, [onPermissionChanged]);

    useEffect(() => {
        if (loadingPermissions) return;

        const deniedPermissions         = permissionNames.filter(permissionName => permissions[permissionName] === "denied");
        const isPermissionNotGranted    = deniedPermissions.length > 0 || permissionNames.some(permissionName => permissions[permissionName] !== "granted");

        if (onPermissionChangedRef.current) {
            onPermissionChangedRef.current(!isPermissionNotGranted);
        }
    }, [permissionNames, permissions, loadingPermissions]);


    return (
        <Modal
            show={modalIsOpen}
            onHide={() => {
                if (!deniedPermissions.includes("geo") && !deniedPermissions.includes("camera")) {
                    setIsOpen(false);
                    closeModal();
                }
            }}
            className="permissions_spotCheck"
        >
            <Modal.Header>
                <Modal.Title>Required Device Permissions</Modal.Title>
            </Modal.Header>

            <Modal.Body>
                {deniedPermissions.length > 0 && (
                    <div>
                        <p>The {deniedPermissionsString} permission(s) have been denied. They can be re-enabled by following these steps:</p>

                        <h5>If Installed to Home Screen:</h5>
                        <ul>
                            <li>Delete app from home screen and reinstall it from a browser</li>
                        </ul>

                        <h5>If in Browser:</h5>
                        <ul>
                        {device_type === 'Android' ?
                        (<li>
                            <h6>On Chrome</h6>
                            <ul>
                                <li>Click on the "lock" icon in the browser bar</li>
                                <li>Click on "Permissions"</li>
                                <li>Click on "Reset Permissions"</li>
                            </ul>
                        </li>) :
                        (<li>
                            <h6>On Safari</h6>
                            <ul>
                                <li>In the device "Settings" app</li>
                                <li>Scroll down to and click on Safari</li>
                                <li>Scroll down to "Settings for Websites" section</li>
                                <li>Click on the individual Settings (eg "Camera") and ...
                                    <ul>
                                        <li>Delete the OurVoice website from the list...</li>
                                        <li>Or If there is no website list, simply reset the permission to "Ask"</li>
                                    </ul>
                                </li>
                            </ul>
                        </li>)
                        }
                        </ul>
                    </div>
                )}
                <div className="permissions">
                    {permissionNames.map(permissionName => (
                        permissions[permissionName] !== "denied" && (
                            <div key={permissionName}>
                                <PermissionButton
                                    permissionName={permissionName}
                                    isGranted={permissions[permissionName] === "granted"}
                                    isLoading={loading[permissionName]}
                                    onGrant={() => {
                                        requestPermission(permissionName)
                                    }}

                                    iconGranted={permission_messaging[permissionName]["icon"]}
                                    iconLocked={<Lock size={40}/>}
                                    description={permission_messaging[permissionName]["msg"]}
                                />
                            </div>
                        )
                    ))}
                </div>
            </Modal.Body>
        </Modal>
    );
}

export default PermissionModal;
