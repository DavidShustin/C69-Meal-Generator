import React, { useState, useEffect, useContext } from "react";
import { Context } from "../store/appContext";
import "../../styles/menu.css";

export const Menu = (props) => {
    const {store, actions} = useContext(Context)
    const { menuType, dishes } = props;

    const handleFavorites = async(dishId) => {
        if (!store.token) {
            alert("please log in to save favorites");
            return 
        }
        await actions.toggleFavorite(dishId);
    }

    const isFavorite = (dishId) => {
        return store.favorites.some(fav => fav.dish_id === dishId)
    }

    return (
        <div className="full-menu">
            {(!menuType || !dishes.length) && (<div class="spinner-border" role="status">
                <span class="visually-hidden">Loading...</span>
            </div>)}
            {(!!menuType && !!dishes.length) && (
                <>
                    <ul className="menu py-1">
                        {dishes.map(dish => (
                            <li className="dish mb-3" key={dish.id}>
                                <div className="name-of-dish d-flex align-items-center justify-content-center">
                                <h2 className="dish-name mb-0">{dish.name}</h2>
                                <button 
                                    className="favorites-button btn btn-sm ms-2 btn-light"
                                    onClick={() => handleFavorites(dish.id)}
                                >
                                    <i className={`fa-${isFavorite(dish.id) ? 'solid' : 'regular'} fa-heart`} />
                                </button>
                                </div>
                                <div className="ingredients container pt-1 pd">
                                    {dish.ingredients.map(ingredient => ingredient.name).join(', ')}
                                </div>
                            </li>
                        ))}
                    </ul>
                </>
            )}
        </div>
    )
};
