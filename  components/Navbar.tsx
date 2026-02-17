import React from "react";
import {Box} from "lucide-react";
import {useOutletContext} from "react-router";


const Navbar = () => {

    const { isSignedIn, userName, signIn, signOut } = useOutletContext<AuthContext>()

    const handleAuthClick = async  () => {
        if (isSignedIn) {
            try {
                await  signOut();
            } catch (error) {
                console.log(`puter sign out failed: ${error}`);
            }
            return
        }try {
            await signIn();
        } catch (error) {
            console.log(`puter sign in failed: ${error}`);
        }

    }

    return (
        <header className={"navbar"}>
            <nav className={'inner'}>

                <div className={'left'}>
                    <div className={'brand'}>
                        <Box className={'logo'}/>

                        <span className={'name'}>
                            Roomify
                        </span>
                    </div>

                    <ul className={'links'}>
                        <a href="#">Product</a>
                        <a href="#">Pricing</a>
                        <a href="#">Community</a>
                        <a href="#">Enterprise</a>
                        <a href="#">Another</a>
                    </ul>

                </div>

                <div className={'actions'}>
                    {isSignedIn ? (
                        <>
                            <span className={'greeting'}>{userName ?`Hi, ${userName}`: 'Signed in'}</span>
                            <button onClick={handleAuthClick} className={'btn cta'}>Log Out</button>
                        </>

                    ) : (
                        <>
                            <button onClick={handleAuthClick} >
                                Log In
                            </button>

                            <a href="#upload" className={'cta'}>Get Started</a>

                        </>
                    )}

                </div>
            </nav>

        </header>
    )
}
export default Navbar;